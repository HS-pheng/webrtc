<template>
  <video
    ref="video"
    autoplay
    playsinline
    class="transform rotate-y-180 bg-gray-500 w-xs"
  ></video>
</template>
<script setup lang="ts">
const video = ref<HTMLVideoElement | null>(null);
const stream = ref<MediaStream>(new MediaStream());
const props = defineProps<{
  peer;
}>();

onMounted(() => {
  stream.value.addTrack(props.peer.track);
  video.value.srcObject = stream.value;
});
</script>
