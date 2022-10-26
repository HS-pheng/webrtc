import { Consumer } from 'mediasoup-client/lib/Consumer';
import { defineStore } from 'pinia';

export const usePeerStore = defineStore('peerStore', () => {
  const peers = ref(new Map<string, Consumer>());

  const addPeer = (consumer) => {
    peers.value.set(consumer.id, consumer);
  };

  const removePeer = (producerId) => {
    for (const [key, value] of peers.value) {
      if (value.producerId === producerId) {
        value.close();
        peers.value.delete(key);
      }
    }
  };

  return {
    peers,
    addPeer,
    removePeer,
  };
});
