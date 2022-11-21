<template>
  <div>
    <LocalVideo v-if="!isInterviewer" :style="candidateStyle" class="m-auto" />
    <Peer
      v-if="candidate"
      :tracks="extractTracks(candidate.consumers)"
      :peer-info="candidate.peerInfo"
      :style="candidateStyle"
      class="m-auto"
    />
  </div>
</template>

<script setup lang="ts">
import { IPeer } from '~~/constants/types';
import { extractTracks } from '~~/utils/utils';

const isInterviewer = inject('isInterviewer');

defineProps<{
  candidate: IPeer;
  candidateStyle;
}>();
</script>
