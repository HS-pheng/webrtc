<template>
  <div class="flex m-4 flex-col">
    <div class="mx-auto flex flex-row gap-4">
      <LocalVideo :video-track="localVideoTrack" />
      <RemotePeers />
    </div>
    <div class="flex flex-col">
      <CandidateList />
      <CommonButton @click="requestNextCandidate"> Next </CommonButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCandidateStore } from '~~/stores/useCandidateStore';

const { $msManager } = useNuxtApp();
const { connected } = useSocketConnection();
const interviewManager = useInterviewManager();

const candidateStore = useCandidateStore();

const localVideoTrack = ref<MediaStreamTrack | null>(null);
const localAudioTrack = ref<MediaStreamTrack | null>(null);

const joinInterviewRoom: any = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
  });
  const videoTrack = stream.getVideoTracks()[0];
  const audioTrack = stream.getAudioTracks()[0];
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

whenever(
  connected,
  () => {
    joinInterviewRoom();
    interviewManager.joinGroup('interviewer');
    renderCandidateList();
  },
  { immediate: true },
);

onUnmounted(() => {
  localVideoTrack.value?.stop();
  localAudioTrack.value?.stop();
});
</script>
