<template>
  <div ref="screen" class="w-full h-35rem flex-col">
    <InterviewerVideoGrid
      :interviewers="interviewers"
      :interviewer-style="interviewerStyle"
    >
      <LocalVideo v-if="isInterviewer" :style="interviewerStyle" />
    </InterviewerVideoGrid>

    <CandidateVideo :candidate="candidate" :candidate-style="candidateStyle">
      <LocalVideo
        v-if="!isInterviewer"
        :style="candidateStyle"
        class="m-auto"
      />
    </CandidateVideo>
  </div>
</template>

<script setup lang="ts">
import { IPeer } from '~~/constants/types';
import { calcViewlayout, extractItemStyle } from '~~/utils/utils';
const props = defineProps<{ peers: IPeer[] }>();

// isInterviewer: Ref<boolean>
const isInterviewer = inject('isInterviewer');

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
</script>
