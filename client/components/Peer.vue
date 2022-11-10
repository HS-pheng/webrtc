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
  tracks: {
    video: MediaStreamTrack;
    audio: MediaStreamTrack;
  };
}>();

onMounted(() => {
  stream.value = new MediaStream();
  video.value.srcObject = stream.value;
});

const videoTrack = computed(() => props.tracks.video);
const audioTrack = computed(() => props.tracks.audio);

whenever(stream, (newStream) => {
  videoTrack.value && newStream.addTrack(videoTrack.value);
  audioTrack.value && newStream.addTrack(audioTrack.value);
});
</script>
