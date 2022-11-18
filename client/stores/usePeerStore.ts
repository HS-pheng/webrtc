import { Consumer } from 'mediasoup-client/lib/Consumer';
import { defineStore } from 'pinia';
import { IPeer, IPeerInfo } from '~~/constants/types';

export const usePeerStore = defineStore('peerStore', () => {
  const peers = ref(new Map<string, IPeer>());

  const addPeerConsumer = (consumer: Consumer) => {
    const peerId = consumer.appData.producerClientId as string;
    const peer = peers.value.get(peerId);
    peer.consumers.push(consumer);
    peers.value.set(peerId, peer);
  };

  const addPeerInfo = (peerInfo: IPeerInfo, peerId: string) => {
    let peer = peers.value.get(peerId);
    if (!peer) {
      peer = {};
      peer.consumers = [];
    }
    peer.peerInfo = peerInfo;
    peers.value.set(peerId, peer);
  };

  const removePeer = (producerClientId) => {
    const peer = peers.value.get(producerClientId);
    peer?.consumers && peer.consumers.forEach((consumer) => consumer.close());
    peers.value.delete(producerClientId);
  };

  const destroyPeers = () => {
    for (const [, peer] of peers.value) {
      peer.consumers.forEach((consumer) => consumer.close());
    }
    peers.value = new Map<string, IPeer>();
  };

  return {
    peers,
    addPeerConsumer,
    removePeer,
    destroyPeers,
    addPeerInfo,
  };
});
