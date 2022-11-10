<template>
  <div>
    <div v-if="interviewFinished">
      <p>Your interview is finished</p>
      <CommonButton @click.once="navigateTo('/')">Home</CommonButton>
    </div>
    <div v-else class="flex m-4 flex-col">
      <div class="mx-auto flex flex-row gap-4">
        <LocalVideo :video-track="localVideoTrack" />
        <RemotePeers />
      </div>
      <div v-if="isInterviewer" class="flex flex-col">
        <CandidateList />
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

const localVideoTrack = ref<MediaStreamTrack | null>(null);
const localAudioTrack = ref<MediaStreamTrack | null>(null);

const route = useRoute();
const isInterviewer = computed(() => route?.query.interviewer === 'true');
const interviewFinished = ref(false);

const joinInterviewRoom = async () => {
  const { videoTrack, audioTrack } = await getUserTracks();
  const setUpMode = 'both';
  await $msManager.init(setUpMode);
  await $msManager.createProducer(videoTrack);
  await $msManager.createProducer(audioTrack);
  await $msManager.joinRoom();
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

onMounted(attachInterviewEventListener);

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

onUnmounted(() => {
  stopTrack();
  disconnectSocket();
  peerStore.destroyPeers();
});

function stopTrack() {
  localVideoTrack.value?.stop();
  localAudioTrack.value?.stop();
}

async function getUserTracks() {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
  });
  const videoTrack = stream.getVideoTracks()[0];
  const audioTrack = stream.getAudioTracks()[0];

  return { videoTrack, audioTrack };
}

function attachInterviewEventListener() {
  const interviewEventListener = useEventBus('interviewEvents');
  interviewEventListener.on((event) => {
    if (event === 'interview-finished') {
      interviewFinished.value = true;
      stopTrack();
    }
  });
}
</script>
