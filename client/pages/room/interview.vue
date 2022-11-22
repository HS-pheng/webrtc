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
    </div>
    <MediaControllerBar />
  </div>
</template>

<script setup lang="ts">
import { useCandidateStore } from '~~/stores/useCandidateStore';
import { usePeerStore } from '~~/stores/usePeerStore';

const { $msManager } = useNuxtApp();
const { connected, disconnectSocket } = useSocketConnection();

const interviewManager = useInterviewManager();
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
  await localMedia.getMedia();
  const setUpMode = 'both';
  await $msManager.init(setUpMode);
  await $msManager.createProducer(
    localMedia.videoTrack.value as MediaStreamTrack,
  );
  await $msManager.createProducer(
    localMedia.audioTrack.value as MediaStreamTrack,
  );

  await interviewManager.loadPeersInfo();
  await loadPeersConsumers();
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
  localMedia.stopMedia();
  disconnectSocket();
  peerStore.destroyPeers();
}

const peers = computed(() => {
  const peers = [];
  for (const [, peer] of peerStore.peers) {
    peers.push(peer);
  }
  return peers;
});
</script>
