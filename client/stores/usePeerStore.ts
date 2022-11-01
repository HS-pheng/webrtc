import { defineStore } from 'pinia';
import { IPeerConsumers } from '~~/constants/types';

export const usePeerStore = defineStore('peerStore', () => {
  const peers = ref(new Map<string, IPeerConsumers>());

  const addPeer = (consumer, producerClientId) => {
    let peerConsumers = peers.value.get(producerClientId);
    if (!peerConsumers) {
      peerConsumers = {};
    }
    peerConsumers[`${consumer.track.kind}Consumer`] = consumer;
    peers.value.set(producerClientId, peerConsumers);
  };

  const removePeer = (producerClientId) => {
    const peerConsumers = peers.value.get(producerClientId);
    for (const kind in peerConsumers) {
      peerConsumers[kind].close();
    }
    peers.value.delete(producerClientId);
  };

  return {
    peers,
    addPeer,
    removePeer,
  };
});
