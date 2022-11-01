<template>
  <div class="flex m-4 flex-col">
    <div class="mx-auto flex flex-row gap-4">
      <div class="flex flex-col gap-4 border-3">
        <h3 class="text-center">Local video</h3>
        <video
          v-if="readyToProduceVideo"
          ref="localVideo"
          class="transform rotate-y-180 bg-gray-500 w-xs"
          autoplay
          playsinline
        ></video>
      </div>
      <div v-if="hasRemotePeer" class="flex flex-col gap-4 border-3">
        <h3 class="text-center">Remote video</h3>
        <div class="flex flex-wrap gap-4">
          <Peer
            v-for="[peerId, consumers] in ps.peers"
            :key="peerId"
            :tracks="extractTracks(consumers)"
          />
        </div>
      </div>
    </div>
    <div class="flex">
      <div class="border-3 mt-3 mb-3 p-3 flex-grow">
        <p>Candidate list</p>
        <ul>
          <p v-if="candidateList.length === 0">No candidate</p>
          <div>
            <li v-for="(name, index) in candidateList" :key="name">
              {{ index + 1 }}. {{ name }}
            </li>
          </div>
        </ul>
        <button
          class="bg-red-500 bg-opacity-30 py-1 px-8 rounded-3xl"
          @click="nextCandidate"
        >
          Next
        </button>
      </div>
      <div class="border-3 mt-3 mb-3 p-3 flex-grow">
        <p>Current candidate</p>
        <p>{{ candidateStore.currentCandidate }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCandidateStore } from '~~/stores/useCandidateStore';
import { usePeerStore } from '~~/stores/usePeerStore';

const { $msManager } = useNuxtApp();
const { connected } = useSocketConnection();
const interviewManager = useInterviewManager();

const ps = usePeerStore();
const candidateStore = useCandidateStore();

const localVideoTrack = ref<MediaStreamTrack | null>(null);
const localAudioTrack = ref<MediaStreamTrack | null>(null);
const localVideo = ref(null);
const readyToProduceVideo = ref(false);

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
  readyToProduceVideo.value = true;
  await $msManager.joinRoom();
  localVideo.value.srcObject = new MediaStream([videoTrack]);
  localVideoTrack.value = videoTrack;
  localAudioTrack.value = audioTrack;
};

const renderCandidateList = async () => {
  const candidateList = await interviewManager.getCandidateList();
  candidateStore.init(candidateList);
};

const nextCandidate = () => {
  if (connected.value) interviewManager.requestNextCandidate();
};

whenever(
  connected,
  () => {
    joinInterviewRoom();
    interviewManager.joinInterviewerGroup();
    renderCandidateList();
  },
  { immediate: true },
);

const hasRemotePeer = computed(() => ps.peers.size !== 0);
const candidateList = computed(() => candidateStore.candidateList);

const extractTracks = (consumers) => {
  const tracks = {};
  for (const consumerKind in consumers) {
    const trackKind = consumers[consumerKind].track.kind;
    tracks[trackKind] = consumers[consumerKind].track;
  }
  return tracks;
};

onUnmounted(() => {
  localVideoTrack.value?.stop();
  localAudioTrack.value?.stop();
});
</script>
