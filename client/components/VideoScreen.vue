<template>
  <div ref="screen" class="w-full h-35rem flex-col">
    <InterviewerVideoGrid
      :interviewers="interviewers"
      :interviewer-style="smallDisplay"
    >
      <LocalVideo v-if="isInterviewer" :style="smallDisplay" />
    </InterviewerVideoGrid>

    <HighlightVideo
      v-if="hasPresenter || candidate || !isInterviewer"
      :candidate="candidate"
      :large-display="largeDisplay"
      :candidate-style="candidateStyle"
      :display-track="props.displayTrack"
    >
      <LocalVideo v-if="!isInterviewer" :style="candidateStyle" />
    </HighlightVideo>
  </div>
</template>

<script setup lang="ts">
import { IPeer } from '~~/constants/types';
import { calcViewlayout, extractItemStyle } from '~~/utils/utils';
const props = defineProps<{
  peers: IPeer[];
  displayTrack: MediaStreamTrack | null;
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
const candidateStyle = computed(() =>
  hasPresenter.value ? { height: '130px' } : largeDisplay.value,
);
const screen = ref<HTMLElement | null>(null);
const resizeObserver = ref<ResizeObserver | null>(null);

const hasPresenter = computed(() => !!props.displayTrack);

onMounted(() => {
  render();
  resizeObserver.value = new ResizeObserver(render);
  if (screen.value) resizeObserver.value.observe(screen.value);
});

onBeforeUnmount(() => {
  if (resizeObserver.value) resizeObserver.value.disconnect();
});

watch([() => props.peers.length, hasPresenter], render, { immediate: true });

function render() {
  if (!screen.value) return;

  const height = screen.value.clientHeight;
  const width = screen.value.clientWidth;
  let numItems = props.peers.length + 1;

  hasPresenter.value && numItems++;

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
