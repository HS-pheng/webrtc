<template>
  <div class="overflow-hidden relative">
    <h3
      class="text-center z-1 absolute bottom-0 bg-opacity-50 text-white bg-slate-600 p-1"
    >
      You
    </h3>
    <video
      ref="localVideo"
      autoplay
      playsinline
      class="transform rotate-y-180 bg-gray-500 m-auto -z-1 h-full w-full object-cover"
    ></video>
  </div>
</template>
<script setup lang="ts">
// localVideoTracks: Ref<MediaStreamTrack>
const localVideoTrack = inject('localVideoTrack') as any;

const localVideo = ref<HTMLVideoElement | null>(null);
const localStream = ref<MediaStream | null>(null);

onMounted(() => {
  localStream.value = new MediaStream();
  localVideo.value!.srcObject = localStream.value;
});

watchEffect(() => {
  if (localStream.value && localVideoTrack.value) {
    const previousTrack = localStream.value.getVideoTracks()[0];
    previousTrack && localStream.value.removeTrack(previousTrack);
    localStream.value.addTrack(localVideoTrack.value);
  }
});
</script>
