<template>
  <div ref="container" class="overflow-hidden relative">
    <div v-show="isBigScreen || !localDisplayTrack" :class="camStyle">
      <video
        ref="camVideo"
        autoplay
        playsinline
        class="transform bg-gray-500 -z-1 m-auto h-full w-full object-cover"
      ></video>
    </div>
    <h3
      class="text-center z-1 absolute bottom-0 bg-opacity-50 text-white bg-slate-600 p-1 text-s"
    >
      You
    </h3>
    <video
      v-show="localDisplayTrack"
      ref="screenshareVideo"
      autoplay
      playsinline
      class="m-auto w-full h-full bg-gray-500"
    ></video>
    <Icon
      v-if="localDisplayTrack"
      class="absolute bottom-0 right-0 z-1 cursor-pointer"
      name="radix-icons:enter-full-screen"
      size="50px"
      @click="toggleFullscreen"
    />
  </div>
</template>
<script setup lang="ts">
const camVideo = ref<HTMLVideoElement | null>(null);
const camStream = ref<MediaStream | null>(null);
const container = ref<HTMLElement | null>(null);
const screenshareVideo = ref<HTMLVideoElement | null>(null);
const screenshareStream = ref<MediaStream | null>(null);
const { toggle: toggleFullscreen } = useFullscreen(container);
const resizeObserver = ref<ResizeObserver | null>(null);
const isBigScreen = ref(false);

const localVideoTrack = inject('localVideoTrack') as any;
const localDisplayTrack = inject('localDisplayTrack') as any;

const camStyle = computed(() => {
  if (localDisplayTrack.value) {
    return isBigScreen.value && 'h-130px absolute bottom-0';
  }
  return 'absolute h-full w-full bottom-0';
});

onMounted(() => {
  camStream.value = new MediaStream();
  camVideo.value!.srcObject = camStream.value;

  screenshareStream.value = new MediaStream();
  screenshareVideo.value!.srcObject = screenshareStream.value;

  resizeObserver.value = new ResizeObserver(() => {
    const height = container.value?.clientHeight;
    const width = container.value?.clientWidth;
    console.log({ height, width });
    if (!height) return;
    isBigScreen.value = height > 300;
  });
  if (container.value) resizeObserver!.value.observe(container.value);
});

watchEffect(() => {
  if (camStream.value && localVideoTrack.value) {
    const previousTrack = camStream.value.getVideoTracks()[0];
    previousTrack && camStream.value.removeTrack(previousTrack);
    camStream.value.addTrack(localVideoTrack.value);
  }
});

watchEffect(() => {
  if (screenshareStream.value && localDisplayTrack.value) {
    const previousTrack = screenshareStream.value.getVideoTracks()[0];
    previousTrack && screenshareStream.value.removeTrack(previousTrack);
    screenshareStream.value.addTrack(localDisplayTrack.value);
  }
});

onBeforeUnmount(() => {
  if (resizeObserver.value) resizeObserver.value.disconnect();
});
</script>
