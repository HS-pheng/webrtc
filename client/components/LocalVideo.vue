<template>
  <div class="flex flex-col gap-4 border-3">
    <h3 class="text-center">Local video</h3>
    <video
      ref="localVideo"
      class="transform rotate-y-180 bg-gray-500 w-xs"
      autoplay
      playsinline
    ></video>
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{ videoTrack: MediaStreamTrack }>();

const localVideo = ref<HTMLVideoElement | null>(null);
const localStream = ref<MediaStream>(new MediaStream());

onMounted(() => {
  localVideo.value.srcObject = localStream.value;
});

watch(
  () => props.videoTrack,
  () => localStream.value.addTrack(props.videoTrack),
);
</script>
