<template>
  <div ref="screen" class="w-full h-35rem flex-col">
    <div class="flex justify-center gap-10px p-10px">
      <LocalVideo v-if="isInterviewer" :style="interviewerStyle" />
      <Peer
        v-for="(peer, index) in interviewers"
        :key="index"
        :tracks="extractTracks(peer.consumers)"
        :peer-info="peer.peerInfo"
        :style="interviewerStyle"
      />
    </div>
    <div>
      <LocalVideo
        v-if="!isInterviewer"
        :style="candidateStyle"
        class="m-auto"
      />
      <Peer
        v-if="candidate"
        :tracks="extractTracks(candidate.consumers)"
        :peer-info="candidate.peerInfo"
        :style="candidateStyle"
        class="m-auto"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { IPeer } from '~~/constants/types';
import { calcViewlayout, extractTracks } from '~~/utils/utils';
const props = defineProps<{ peers: IPeer[]; isInterviewer: boolean }>();

const interviewers = computed(() =>
  props.peers.filter((peer) => peer.peerInfo.isInterviewer === 'true'),
);

const candidate = computed(() =>
  props.peers.find((peer) => peer.peerInfo.isInterviewer === 'false'),
);

const interviewerStyle = ref({ visibility: 'hidden' });
const candidateStyle = ref({ visibility: 'hidden' });
const screen = ref<HTMLElement | null>(null);
const resizeObserver = ref<ResizeObserver | null>(null);

onMounted(() => {
  render();
  resizeObserver.value = new ResizeObserver(render);
  if (screen.value) resizeObserver.value.observe(screen.value);
});

onBeforeUnmount(() => {
  if (resizeObserver.value) resizeObserver.value.disconnect();
});

watch([() => props.peers.length], render, { immediate: true });

function render() {
  if (!screen.value) return;

  const height = screen.value.clientHeight;
  const width = screen.value.clientWidth;
  const numItems = props.peers.length + 1;

  if (height <= 0 || width <= 0) return;

  const items = calcViewlayout(width, height, numItems);

  if (items.length === 1) {
    interviewerStyle.value = candidateStyle.value = extractItemStyle(items[0]);
    return;
  }
  interviewerStyle.value = extractItemStyle(items[1]);
  candidateStyle.value = extractItemStyle(items[0]);
}

function extractItemStyle(item) {
  return {
    visibility: 'visible',
    width: `${item.width}px`,
    height: `${item.height}px`,
  };
}
</script>
