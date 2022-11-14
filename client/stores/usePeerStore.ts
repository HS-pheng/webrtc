import { Consumer } from 'mediasoup-client/lib/Consumer';
import { defineStore } from 'pinia';
import { IPeer } from '~~/constants/types';

export const usePeerStore = defineStore('peerStore', () => {
  const peers = ref(new Map<string, IPeer>());

  const addPeer = (consumer: Consumer, name: string, peerId: string) => {
    let peer = peers.value.get(peerId);
    if (!peer) {
      peer = {};
      peer.consumers = [];
    }
    peer.consumers.push(consumer);
    peer.username = name;
    peers.value.set(peerId, peer);
  };

  const removePeer = (producerClientId) => {
    const peer = peers.value.get(producerClientId);
    peer?.consumers && peer.consumers.forEach((consumer) => consumer.close());
    peers.value.delete(producerClientId);
  };

  const destroyPeers = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [peerId, peer] of peers.value) {
      peer.consumers.forEach((consumer) => consumer.close());
    }
    peers.value = new Map<string, IPeer>();
  };

  return {
    peers,
    addPeer,
    removePeer,
    destroyPeers,
  };
});
