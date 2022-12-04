<template>
  <div>
    <div ref="container" :style="candidateStyle" class="m-auto relative">
      <div class="absolute bottom-0">
        <slot />
        <Peer
          v-if="candidate"
          :tracks="extractTracks(candidate.consumers)"
          :peer-info="candidate?.peerInfo"
          :style="candidateStyle"
          :display-track="candidate.displayConsumer?.track"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IPeer } from '~~/constants/types';
import { extractTracks } from '~~/utils/utils';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{
  candidate: IPeer | undefined;
  candidateStyle: any;
}>();
</script>
