<template>
  <div>
    <slot />
    <Peer
      v-if="candidate"
      :tracks="extractTracks(candidate.consumers)"
      :peer-info="candidate?.peerInfo"
      :style="candidateStyle"
      class="m-auto"
    />
  </div>
</template>

<script setup lang="ts">
import { IPeer } from '~~/constants/types';
import { extractTracks } from '~~/utils/utils';

defineProps<{
  candidate: IPeer | undefined;
  candidateStyle: any;
}>();
</script>
