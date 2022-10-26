<template>
  <div class="flex">
    <div class="mx-auto flex flex-row">
      <div class="flex flex-col">
        <h3 class="text-center">Local video</h3>
        <video
          ref="localVideo"
          class="transform rotate-y-180 bg-gray-500"
          autoplay
          playsinline
        ></video>
        <button class="self-center" @click="joinRoom">Join Room</button>
      </div>
      <div class="flex flex-col">
        <h3 class="text-center">Remote video</h3>
        <Peer v-for="peer in ps.peers" :key="peer.id" :peer="peer" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePeerStore } from '~~/stores/usePeerStore';
import { useWebsocket } from '~~/stores/useWebsocket';
import { SocketPromise } from '~~/utils/socket-promise';

const { $msManager } = useNuxtApp();
const ws = useWebsocket();
const ps = usePeerStore();

onMounted(() => {
  ws.connect();
  $msManager.socketInit(ws.socket as SocketPromise);
});

const localVideo = ref(null);

const joinRoom: any = async () => {
  const localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
  });
  const setUpMode = 'both';
  await $msManager.init(setUpMode);
  await $msManager.createProducer(localStream.getVideoTracks()[0]);
  await $msManager.joinRoom();
  localVideo.value.srcObject = localStream;
};
</script>

<style scoped>
video {
  width: 320px;
  background-color: black;
  filter: grayscale();
}
</style>
