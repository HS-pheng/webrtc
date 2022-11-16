<template>
  <div>
    <div v-if="interviewFinished">
      <p>Your interview is finished</p>
      <CommonButton @click.once="navigateTo('/')">Home</CommonButton>
    </div>
    <div v-else class="flex m-4 flex-col">
      <div class="mx-auto flex flex-row gap-4">
        <LocalVideo :video-track="localVideoTrack" />
        <RemotePeers v-if="hasRemotePeer" />
      </div>
      <div v-if="isInterviewer" class="flex flex-col">
        <CandidateList
          :current-candidate="candidateStore.currentCandidate"
          :candidate-list="candidateStore.candidateList"
        />
        <CommonButton @click="requestNextCandidate"> Next </CommonButton>
      </div>
    </div>
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
const isInterviewer = computed(() => route?.query.interviewer === 'true');
const interviewFinished = ref(false);
const interviewEventListener = useEventBus('interviewEvents');
attachInterviewEventListener();

const localVideoTrack = ref<MediaStreamTrack | null>(null);
const localAudioTrack = ref<MediaStreamTrack | null>(null);

const joinInterviewRoom = async () => {
  const { videoTrack, audioTrack } = await useLocalMedia();
  const setUpMode = 'both';
  await $msManager.init(setUpMode);
  await $msManager.createProducer(videoTrack);
  await $msManager.createProducer(audioTrack);

  await interviewManager.loadPeersInfo();
  await $msManager.loadPeersMSConsumers();

  localVideoTrack.value = videoTrack;
  localAudioTrack.value = audioTrack;
};

const renderCandidateList = async () => {
  const candidateList = await interviewManager.getCandidateList();
  candidateStore.init(candidateList);
};

const requestNextCandidate = () => {
  if (connected.value) interviewManager.requestNextCandidate();
};

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

function stopTrack() {
  localVideoTrack.value?.stop();
  localAudioTrack.value?.stop();
}

function attachInterviewEventListener() {
  interviewEventListener.on((event) => {
    if (event === 'interview-finished') {
      interviewFinished.value = true;
      disconnectionCleanup();
    }
  });
}

const hasRemotePeer = computed(() => peerStore.peers.size !== 0);
function disconnectionCleanup() {
  stopTrack();
  disconnectSocket();
  peerStore.destroyPeers();
}
</script>
