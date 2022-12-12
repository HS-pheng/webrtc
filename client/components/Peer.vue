<template>
  <div ref="container" class="overflow-hidden relative">
    <div v-show="isBigScreen || !displayTrack" :class="camStyle">
      <video
        ref="camVideo"
        autoplay
        playsinline
        class="transform bg-gray-500 -z-1 m-auto h-full w-full object-cover"
      ></video>
    </div>
    <h3
      class="text-center z-1 absolute bottom-0 bg-opacity-50 text-white bg-slate-600 p-1"
    >
      {{ username }}
    </h3>
    <video
      v-show="displayTrack"
      ref="screenshareVideo"
      autoplay
      playsinline
      class="m-auto w-full h-full bg-gray-500"
    ></video>
    <Icon
      v-if="displayTrack"
      class="absolute bottom-0 right-0 z-1"
      name="radix-icons:enter-full-screen"
      size="50px"
      @click="toggleFullscreen"
    />
  </div>
</template>
<script setup lang="ts">
import { IPeerInfo } from '~~/constants/types';

const camVideo = ref<HTMLVideoElement | null>(null);
const camStream = ref<MediaStream | null>(null);
const container = ref<HTMLElement | null>(null);
const screenshareVideo = ref<HTMLVideoElement | null>(null);
const screenshareStream = ref<MediaStream | null>(null);
const { toggle: toggleFullscreen } = useFullscreen(container);
const resizeObserver = ref<ResizeObserver | null>(null);
const isBigScreen = ref(false);

const props = defineProps<{
  tracks: MediaStreamTrack[];
  peerInfo: IPeerInfo;
  displayTrack: any;
}>();

const camStyle = computed(() => {
  if (props.displayTrack) {
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

const tracks = computed(() => props.tracks);
const username = computed(() => props.peerInfo.username);

watch([camStream, tracks], ([currentStream, newTracks], [, oldTracks]) => {
  if (currentStream) {
    oldTracks.forEach((track) => {
      if (!newTracks.includes(track)) currentStream.removeTrack(track);
    });
    newTracks.forEach((track) => {
      if (!oldTracks.includes(track)) currentStream.addTrack(track);
    });
  }
});

watchEffect(() => {
  if (screenshareStream.value && props.displayTrack) {
    const previousTrack = screenshareStream.value.getVideoTracks()[0];
    previousTrack && screenshareStream.value.removeTrack(previousTrack);
    screenshareStream.value.addTrack(props.displayTrack);
  }
});

onBeforeUnmount(() => {
  if (resizeObserver.value) resizeObserver.value.disconnect();
});
</script>
