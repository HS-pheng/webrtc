<template>
  <div class="flex justify-center gap-10px p-10px">
    <slot />
    <Peer
      v-for="(peer, index) in interviewers"
      :key="index"
      :tracks="extractTracks(peer.consumers)"
      :peer-info="peer.peerInfo"
      :style="interviewerStyle"
      :display-track="peer.displayConsumer?.track"
    />
  </div>
</template>

<script setup lang="ts">
import { IPeer } from '~~/constants/types';
import { extractTracks } from '~~/utils/utils';

defineProps<{
  interviewers: IPeer[];
  interviewerStyle: any;
}>();
</script>
