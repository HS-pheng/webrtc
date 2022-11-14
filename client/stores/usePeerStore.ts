import { defineStore } from 'pinia';
import { IPeerConsumers } from '~~/constants/types';

export const usePeerStore = defineStore('peerStore', () => {
  const peers = ref(new Map<string, IPeerConsumers>());

  const addPeer = (consumer, producerClientId) => {
    let peerConsumers = peers.value.get(producerClientId);
    if (!peerConsumers) {
      peerConsumers = [];
    }
    peerConsumers.push(consumer);
    peers.value.set(producerClientId, peerConsumers);
  };

  const removePeer = (producerClientId) => {
    const peerConsumers = peers.value.get(producerClientId);
    peerConsumers && peerConsumers.forEach((consumer) => consumer.close());
    peers.value.delete(producerClientId);
  };

  const destroyPeers = () => {
    for (const [, peerConsumers] of peers.value) {
      peerConsumers.forEach((consumer) => consumer.close());
    }
    peers.value = new Map<string, IPeerConsumers>();
  };

  return {
    peers,
    addPeer,
    removePeer,
    destroyPeers,
  };
});
