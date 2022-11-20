<template>
  <div class="flex flex-col gap-4 border-3">
    <h3 class="text-center">Candidate</h3>
    <LocalVideo v-if="!props.isInterviewer" />
    <Peer
      v-for="[peerId, peer] in ps.peers"
      :key="peerId"
      :tracks="extractTracks(peer.consumers)"
      :peer-info="peer.peerInfo"
    />
  </div>
</template>

<script setup lang="ts">
import { Consumer } from 'mediasoup-client/lib/Consumer';
import { usePeerStore } from '~~/stores/usePeerStore';
const props = defineProps<{
  isInterviewer: boolean;
}>();

const ps = usePeerStore();

const extractTracks = (consumers: Consumer[]) =>
  consumers.map((consumer) => consumer.track);
</script>
