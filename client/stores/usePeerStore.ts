import { Consumer } from 'mediasoup-client/lib/Consumer';
import { defineStore } from 'pinia';

export const usePeerStore = defineStore('peerStore', () => {
  const peers = ref(new Map<string, Consumer>());

  const addPeer = (consumer) => {
    peers.value.set(consumer.id, consumer);
  };

  const removePeer = (producerId) => {
    for (const [consumerId, consumer] of peers.value) {
      if (consumer.producerId === producerId) {
        consumer.close();
        peers.value.delete(consumerId);
      }
    }
  };

  return {
    peers,
    addPeer,
    removePeer,
  };
});
