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
        <button class="self-center" @click="send">Send</button>
      </div>
      <div class="flex flex-col">
        <h3 class="text-center">Remote video</h3>
        <video
          ref="remoteVideo"
          class="transform rotate-y-180 bg-gray-500"
          autoplay
          playsinline
        ></video>
        <button class="self-center" @click="receive">Receive</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWebsocket } from '~~/stores/useWebsocket';
import { SocketPromise } from '~~/utils/socket-promise';

const { $msManager } = useNuxtApp();
const ws = useWebsocket();

onMounted(() => {
  ws.connect();
  $msManager.socketInit(ws.socket as SocketPromise);
});

const localVideo = ref(null);
const remoteVideo = ref(null);

const send: any = async (): Promise<void> => {
  const localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
  });
  const setUpMode = 'send';
  await $msManager.init(setUpMode);
  await $msManager.createProducer(localStream.getVideoTracks()[0]);
  localVideo.value.srcObject = localStream;
};

const receive: any = async (): Promise<void> => {
  const setUpMode = 'recv';
  await $msManager.init(setUpMode);
  const remoteTrack = await $msManager.createConsumer();
  const remoteStream = new MediaStream([remoteTrack]);
  remoteVideo.value.srcObject = remoteStream;
};
</script>

<style scoped>
video {
  width: 320px;
  background-color: black;
  filter: grayscale();
}
</style>
