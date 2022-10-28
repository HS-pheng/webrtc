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
  tracks;
}>();

onMounted(() => {
  video.value.srcObject = stream.value;
});

const videoTrack = computed(() => props.tracks.video);
const audioTrack = computed(() => props.tracks.audio);

watch(
  audioTrack,
  (newAudioTrack) => {
    if (newAudioTrack) {
      stream.value.addTrack(newAudioTrack);
    }
  },
  { immediate: true },
);

watch(
  videoTrack,
  (newVideoTrack) => {
    if (newVideoTrack) {
      stream.value.addTrack(newVideoTrack);
    }
  },
  { immediate: true },
);
</script>
