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
const stream = ref<MediaStream | null>(null);
const props = defineProps<{
  tracks: MediaStreamTrack[];
}>();

onMounted(() => {
  stream.value = new MediaStream();
  video.value.srcObject = stream.value;
});

const tracks = computed(() => props.tracks);

watch([stream, tracks], ([newStream, newTracks]) => {
  newStream &&
    newTracks.forEach((element) => {
      newStream.addTrack(element);
    });
});
</script>
