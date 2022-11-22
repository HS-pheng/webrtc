<template>
  <div class="overflow-hidden relative">
    <h3
      class="text-center z-1 absolute bottom-0 bg-opacity-50 text-white bg-slate-600 p-1"
    >
      {{ username }}
    </h3>
    <video
      ref="video"
      autoplay
      playsinline
      class="transform bg-gray-500 -z-1 m-auto h-full w-full object-cover"
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

watch([stream, tracks], ([currentStream, newTracks], [, oldTracks]) => {
  if (currentStream) {
    oldTracks.forEach((track) => {
      if (!newTracks.includes(track)) currentStream.removeTrack(track);
    });
    newTracks.forEach((track) => {
      if (!oldTracks.includes(track)) currentStream.addTrack(track);
    });
  }
});
</script>
