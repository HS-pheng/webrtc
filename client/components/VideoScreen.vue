<template>
  <div ref="screen" class="w-full h-35rem flex-col bg-black">
    <InterviewerVideoGrid
      :interviewers="interviewers"
      :interviewer-style="smallDisplay"
    >
      <LocalVideo v-if="isInterviewer" :style="smallDisplay" />
    </InterviewerVideoGrid>

    <CandidateVideo
      v-if="candidate || !isInterviewer"
      :candidate="candidate"
      :candidate-style="largeDisplay"
    >
      <LocalVideo v-if="!isInterviewer" :style="largeDisplay" />
    </CandidateVideo>
  </div>
</template>

<script setup lang="ts">
import { IPeer } from '~~/constants/types';
import { calcViewlayout, extractItemStyle } from '~~/utils/utils';
const props = defineProps<{
  peers: IPeer[];
}>();

// isInterviewer: Ref<boolean>
const isInterviewer = inject('isInterviewer');

const interviewers = computed(() =>
  props.peers.filter((peer) => peer.peerInfo.isInterviewer === 'true'),
);

const candidate = computed(() =>
  props.peers.find((peer) => peer.peerInfo.isInterviewer === 'false'),
);

const smallDisplay = ref({ visibility: 'hidden' });
const largeDisplay = ref({ visibility: 'hidden' });
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
    smallDisplay.value = largeDisplay.value = extractItemStyle(items[0]);
    return;
  }
  smallDisplay.value = extractItemStyle(items[1]);
  largeDisplay.value = extractItemStyle(items[0]);
}
</script>
