<template>
  <div>
    <div v-if="interviewFinished">
      <p>Your interview is finished</p>
      <CommonButton @click.once="navigateTo('/')">Home</CommonButton>
    </div>
    <div v-else class="flex flex-col">
      <div class="border-3">
        <VideoScreen :peers="peers" />
      </div>
      <div v-if="isInterviewer" class="flex flex-col">
        <CandidateList
          :current-candidate="candidateStore.currentCandidate"
          :candidate-list="candidateStore.candidateList"
        />
        <CommonButton @click="requestNextCandidate"> Next </CommonButton>
      </div>
      <MediaControllerBar
        @media-state-change="handleMediaStateChange"
        @leave-call="disconnectionCleanup"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCandidateStore } from '~~/stores/useCandidateStore';
import { usePeerStore } from '~~/stores/usePeerStore';

const { $msManager } = useNuxtApp();
const { connected, disconnectSocket } = useSocketConnection();

const interviewManager = useInterviewManager();
const signalingManager = useSignaling();
const candidateStore = useCandidateStore();
const peerStore = usePeerStore();

const route = useRoute();
const interviewFinished = ref(false);
const interviewEventListener = useEventBus('interviewEvents');
attachInterviewEventListener();

const isInterviewer = computed(() => route?.query.interviewer === 'true');
provide('isInterviewer', isInterviewer);

const localMedia = useLocalMedia();
provide('localVideoTrack', localMedia.videoTrack);

const joinInterviewRoom = async () => {
  const setUpMode = 'both';
  await $msManager.init(setUpMode);
  await produceMedia('audio');
  await produceMedia('video');

  await interviewManager.loadPeersInfo();
  await loadPeersConsumers();
};

const produceMedia = async (type: 'audio' | 'video') => {
  await localMedia.getMedia(type);
  if (type === 'video') {
    await $msManager.createProducer(
      localMedia.videoTrack.value as MediaStreamTrack,
    );
  } else {
    await $msManager.createProducer(
      localMedia.audioTrack.value as MediaStreamTrack,
    );
  }
};

const renderCandidateList = async () => {
  const candidateList = await interviewManager.getCandidateList();
  candidateStore.init(candidateList);
};

const requestNextCandidate = () => {
  if (connected.value) interviewManager.requestNextCandidate();
};

async function loadPeersConsumers() {
  const consumers = await $msManager.getPeersMSConsumers();
  consumers.forEach((consumer) => peerStore.addPeerConsumer(consumer));
}

whenever(
  connected,
  () => {
    joinInterviewRoom();
    if (isInterviewer.value) {
      interviewManager.joinGroup('interviewer');
      renderCandidateList();
    }
  },
  { immediate: true },
);

onUnmounted(disconnectionCleanup);

function attachInterviewEventListener() {
  interviewEventListener.on((event) => {
    if (event === 'interview-finished') {
      interviewFinished.value = true;
      disconnectionCleanup();
    }
  });
}

function disconnectionCleanup() {
  localMedia.stopMedia('both');
  disconnectSocket();
  peerStore.destroyPeers();
  $msManager.closeTransports();
}

const peers = computed(() => {
  const peers = [];
  for (const [, peer] of peerStore.peers) {
    peers.push(peer);
  }
  return peers;
});

const handleMediaStateChange = async (
  mediaType: 'video' | 'audio',
  status: 'on' | 'off',
) => {
  if (status === 'on') {
    await localMedia.getMedia(mediaType);
  } else {
    localMedia.stopMedia(mediaType);
  }

  const track =
    mediaType === 'video'
      ? localMedia.videoTrack.value
      : localMedia.audioTrack.value;

  const producerId = await $msManager.toggleMediaProducer(mediaType, track);

  signalingManager.signalMediaStateChanged(producerId, status);
};
</script>
