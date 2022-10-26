<template>
  <video
    ref="video"
    autoplay
    playsinline
    class="transform rotate-y-180 bg-gray-500"
  ></video>
</template>
<script setup lang="ts">
const video = ref<HTMLVideoElement | null>(null);
const stream = ref<MediaStream>(new MediaStream());
const props = defineProps<{
  peer;
}>();

console.log('the peer here', props.peer);

onMounted(() => {
  console.log('here');
  video.value.srcObject = new MediaStream([props.peer.track]);
  console.log(video.value.srcObject.getVideoTracks()[0]);
});

watch(
  props.peer,
  (updatedPeer) => {
    console.log({ updatedPeer });
    if (props.peer.track) {
      console.log('got here', props.peer.track);
      stream.value.addTrack(props.peer.track);
    }
  },
  { immediate: true },
);
</script>
