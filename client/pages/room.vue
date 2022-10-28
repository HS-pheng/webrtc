<template>
  <div class="flex m-4">
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
  </div>
</template>

<script setup lang="ts">
import { usePeerStore } from '~~/stores/usePeerStore';

const { $msManager } = useNuxtApp();
const { connected } = useSocketConnection();

const ps = usePeerStore();

const localVideoTrack = ref<MediaStreamTrack | null>(null);
const localVideo = ref(null);
const readyToProduceVideo = ref(false);

const joinRoom: any = async () => {
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
};

watch(
  () => connected,
  (connectionStatus) => {
    if (connectionStatus) {
      joinRoom();
    }
  },
  { immediate: true },
);

const hasRemotePeer = computed(() => ps.peers.size !== 0);

const extractTracks = (consumers) => {
  const tracks = {};
  for (const consumerKind in consumers) {
    const trackKind = consumers[consumerKind].track.kind;
    tracks[trackKind] = consumers[consumerKind].track;
  }
  return tracks;
};

onUnmounted(() => localVideoTrack.value?.stop());
</script>
