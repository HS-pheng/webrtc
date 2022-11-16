<template>
  <div class="flex flex-col gap-4 border-3">
    <h3 class="text-center">{{ userName }}</h3>
    <video
      ref="localVideo"
      class="transform rotate-y-180 bg-gray-500 w-xs"
      autoplay
      playsinline
    ></video>
  </div>
</template>
<script setup lang="ts">
import { useHandshakePayload } from '../stores/useHandshakePayload';
const props = defineProps<{ videoTrack: MediaStreamTrack }>();
const handshakePayload = useHandshakePayload();

const localVideo = ref<HTMLVideoElement | null>(null);
const localStream = ref<MediaStream | null>(null);
const videoTrack = computed(() => props.videoTrack);

const userName = computed(() => handshakePayload.username);

onMounted(() => {
  localStream.value = new MediaStream();
  localVideo.value.srcObject = localStream.value;
});

watchEffect(() => {
  if (localStream.value && videoTrack.value) {
    localStream.value.addTrack(videoTrack.value);
  }
});
</script>
