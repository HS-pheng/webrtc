<template>
  <div>
    <CommonCardHeader :title="listing?.title" class="mb-4">
      <CommonButton @click="$router.push(`/listings/${$route.params.id}`)">
        Back
      </CommonButton>
    </CommonCardHeader>
    <div v-if="isInterviewer" class="flex mb-3">
      <CommonButton @click="stopSession"> Stop Session </CommonButton>
      <CommonButton @click="requestNextCandidate">
        Next Participant
      </CommonButton>
      <CandidateList
        class="ml-auto flex"
        :current-candidate="candidateStore.currentCandidate"
        :candidate-list="candidateStore.candidateList"
      />
      <div class="ml-auto flex">
        <Timer :duration="30" @timer-finished="timerFinished" />
      </div>
    </div>
    <div v-if="interviewFinished">
      <p>Your interview is finished</p>
      <CommonButton @click.once="navigateTo('/')">Home</CommonButton>
    </div>
    <div v-else class="flex flex-col">
      <div class="">
        <VideoScreen :peers="peers" />
      </div>
      <MediaControllerBar
        @media-state-change="handleMediaStateChange"
        @leave-call="disconnectionCleanup"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ListingInfo } from '~~/constants/types';
import { useCandidateStore } from '~~/stores/useCandidateStore';
import { useHandshakePayload } from '~~/stores/useHandshakePayload';
import { usePeerStore } from '~~/stores/usePeerStore';

const { $msManager } = useNuxtApp();
const { connected, disconnectSocket } = useSocketConnection();

const interviewManager = useInterviewManager();
const signalingManager = useSignaling();
const candidateStore = useCandidateStore();
const peerStore = usePeerStore();
const handshakePayload = useHandshakePayload();

const route = useRoute();
const interviewFinished = ref(false);
const interviewEventListener = useEventBus('interviewEvents');
attachInterviewEventListener();

const isInterviewer = computed(() => {
  handshakePayload.isInterviewer = route?.query.interviewer as string;
  return route?.query.interviewer === 'true';
});

provide('isInterviewer', isInterviewer);

const localMedia = useLocalMedia();
provide('localVideoTrack', localMedia.videoTrack);
provide('localDisplayTrack', localMedia.displayTrack);

const listing = ref<ListingInfo | null>(null);

onMounted(async () => {
  listing.value = await $fetch<any>(
    `http://localhost:3001/listings/${route.params.id}`,
  );
});

const joinInterviewRoom = async () => {
  const setUpMode = 'both';
  await $msManager.init(setUpMode);
  await localMedia.getMedia('both');
  await $msManager.createProducer(
    localMedia.audioTrack.value as MediaStreamTrack,
    'audio',
  );
  await $msManager.createProducer(
    localMedia.videoTrack.value as MediaStreamTrack,
    'video',
  );

  await interviewManager.loadPeersInfo();
  await loadPeersConsumers();
};

const renderCandidateList = async () => {
  const candidateList = await interviewManager.getCandidateList();
  candidateStore.init(candidateList);
};

const requestNextCandidate = () => {
  const roomId = route.params.id as string;
  if (connected.value) interviewManager.requestNextCandidate(roomId);
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
  localMedia.stopMedia('display');
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
  mediaType: 'video' | 'audio' | 'display',
  state: 'on' | 'off',
) => {
  if (state === 'on') {
    await localMedia.getMedia(mediaType);
  } else {
    localMedia.stopMedia(mediaType);
  }

  if (mediaType === 'display') {
    if (state === 'off') {
      const displayProducerId = $msManager.displayProducer!.id;
      $msManager.displayProducer!.close();
      signalingManager.signalStopSharing(displayProducerId);
      return;
    }
    await $msManager.createProducer(
      localMedia.displayTrack.value as MediaStreamTrack,
      mediaType,
    );
    return;
  }

  const track =
    mediaType === 'video'
      ? localMedia.videoTrack.value
      : localMedia.audioTrack.value;

  const producerId = await $msManager.toggleMediaProducer(mediaType, track);

  if (!producerId) return;

  signalingManager.signalMediaStateChanged(producerId, state);
};

function stopSession() {
  signalingManager.signalStopSession();
  disconnectionCleanup();
  return navigateTo('/');
}

function timerFinished() {
  requestNextCandidate();
}
</script>
