<template>
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
</template>

<script setup lang="ts">
import { IPeer } from '~~/constants/types';
import { extractTracks } from '~~/utils/utils';

// isInterviewer: Ref<boolean>
const isInterviewer = inject('isInterviewer');

defineProps<{
  interviewers: IPeer[];
  interviewerStyle;
}>();
</script>
