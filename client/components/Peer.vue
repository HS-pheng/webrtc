<template>
  <div>
    <h3 class="text-center">{{ username }}</h3>
    <video
      ref="video"
      autoplay
      playsinline
      class="transform bg-gray-500 w-xs"
    ></video>
  </div>
</template>
<script setup lang="ts">
import { IPeerInfo } from '~~/constants/types';

const video = ref<HTMLVideoElement | null>(null);
const stream = ref<MediaStream | null>(null);
const props = defineProps<{
  tracks: MediaStreamTrack[];
  peerInfo: IPeerInfo;
}>();

onMounted(() => {
  stream.value = new MediaStream();
  video.value.srcObject = stream.value;
});

const tracks = computed(() => props.tracks);
const username = computed(() => props.peerInfo.username);

watch([stream, tracks], ([newStream, newTracks], [, oldTracks]) => {
  if (newStream) {
    oldTracks.forEach((track) => {
      if (!newTracks.includes(track)) newStream.removeTrack(track);
    });
    newTracks.forEach((track) => {
      if (!oldTracks.includes(track)) newStream.addTrack(track);
    });
  }
});
</script>
