<template>
  <div class="flex flex-col items-center w-[400px] mx-auto my-20 border-2">
    <video
      id="video"
      ref="video"
      class="transform rotate-y-180"
      autoplay
      playsinline
    ></video>
    <div class="flex gap-4">
      <button @click="send">Send</button>
      <button @click="receive">Receive</button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { $msManager } = useNuxtApp();

$msManager?.socketInit();
const video = ref(null);

const send: any = async (): Promise<void> => {
  const localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
  });
  const setUpMode = 'send';
  await $msManager?.init(setUpMode);
  await $msManager?.createProducer(localStream.getVideoTracks()[0]);
  video.value.srcObject = localStream;
};

const receive: any = async (): Promise<void> => {
  const setUpMode = 'recv';
  await $msManager?.init(setUpMode);
  const remoteTrack = await $msManager?.createConsumer();
  const remoteStream = new MediaStream([remoteTrack]);
  video.value.srcObject = remoteStream;
};
</script>

<style scoped>
video {
  width: 320px;
  filter: grayscale();
}
</style>
