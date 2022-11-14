<template>
  <div class="flex flex-col gap-4 border-3">
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
import { IPeerConsumers } from '~~/constants/types';
import { usePeerStore } from '~~/stores/usePeerStore';
const ps = usePeerStore();

const extractTracks = (consumers: IPeerConsumers) => {
  const tracks = [];
  consumers.forEach((consumer) => tracks.push(consumer.track));
  return tracks;
};
</script>
