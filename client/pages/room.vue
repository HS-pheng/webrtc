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
          <Peer v-for="[peerId, peer] in ps.peers" :key="peerId" :peer="peer" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { usePeerStore } from '~~/stores/usePeerStore';

const { $msManager } = useNuxtApp();
const { connected } = useSocketConnection();

const ps = usePeerStore();

const localStream = ref<MediaStream | null>(null);
const localVideo = ref(null);
const readyToProduceVideo = ref<boolean>(false);

const joinRoom: any = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
  });
  const setUpMode = 'both';
  await $msManager.init(setUpMode);
  await $msManager.createProducer(stream.getVideoTracks()[0]);
  await $msManager.createProducer(stream.getAudioTracks()[0]);
  readyToProduceVideo.value = true;
  await $msManager.joinRoom();
  localVideo.value.srcObject = stream;
  localStream.value = stream;
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

onUnmounted(() =>
  localStream.value?.getTracks().forEach((track) => track.stop()),
);
</script>
