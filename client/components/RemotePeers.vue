<template>
  <div v-if="hasRemotePeer" class="flex flex-col gap-4 border-3">
    <h3 class="text-center">Remote video</h3>
    <div class="flex flex-wrap gap-4">
      <Peer
        v-for="[peerId, consumers] in ps.peers"
        :key="peerId"
        :tracks="extractTracks(consumers)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePeerStore } from '~~/stores/usePeerStore';
const ps = usePeerStore();
const hasRemotePeer = computed(() => ps.peers.size !== 0);

const extractTracks = (consumers) => {
  const tracks = {};
  for (const consumerKind in consumers) {
    const trackKind = consumers[consumerKind].track.kind;
    tracks[trackKind] = consumers[consumerKind].track;
  }
  return tracks;
};
</script>
