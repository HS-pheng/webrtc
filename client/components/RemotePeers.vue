<template>
  <div class="flex flex-col gap-4 border-3">
    <h3 class="text-center">Remote video</h3>
    <div class="flex flex-wrap gap-4">
      <Peer
        v-for="[peerId, peer] in ps.peers"
        :key="peerId"
        :tracks="extractTracks(peer.consumers)"
        :peer-info="peer.peerInfo"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Consumer } from 'mediasoup-client/lib/Consumer';
import { usePeerStore } from '~~/stores/usePeerStore';
const ps = usePeerStore();

const extractTracks = (consumers: Consumer[]) => {
  const tracks = [];
  consumers.forEach((consumer) => tracks.push(consumer.track));
  return tracks;
};
</script>
