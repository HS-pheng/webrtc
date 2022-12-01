<template>
  <div>
    <div :style="largeDisplay" class="m-auto relative">
      <div class="absolute bottom-0">
        <slot />
        <Peer
          v-if="candidate"
          :tracks="extractTracks(candidate.consumers)"
          :peer-info="candidate?.peerInfo"
          :style="candidateStyle"
        />
      </div>
      <video
        v-show="displayTrack"
        ref="localVideo"
        autoplay
        playsinline
        class="m-auto w-full h-full bg-gray-50"
      ></video>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IPeer } from '~~/constants/types';
import { extractTracks } from '~~/utils/utils';

const props = defineProps<{
  candidate: IPeer | undefined;
  largeDisplay: any;
  displayTrack: MediaStreamTrack | null;
  candidateStyle: any;
}>();

// displayTrack === Ref<MediaStreamTrack | null>
const localVideo = ref<HTMLVideoElement | null>(null);
const localStream = ref<MediaStream | null>(null);

onMounted(() => {
  localStream.value = new MediaStream();
  localVideo.value!.srcObject = localStream.value;
});

watchEffect(() => {
  if (localStream.value && props.displayTrack) {
    const previousTrack = localStream.value.getVideoTracks()[0];
    previousTrack && localStream.value.removeTrack(previousTrack);
    localStream.value.addTrack(props.displayTrack);
  }
});
</script>
