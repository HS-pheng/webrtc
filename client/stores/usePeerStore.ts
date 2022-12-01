import { Consumer } from 'mediasoup-client/lib/Consumer';
import { defineStore } from 'pinia';
import { IPeer, IPeerInfo } from '~~/constants/types';

export const usePeerStore = defineStore('peerStore', () => {
  const peers = ref(new Map<string, IPeer>());
  const presenterScreen = ref<Consumer | null>(null);

  const addPeerConsumer = (consumer: Consumer) => {
    if (consumer.appData.type === 'display') {
      presenterScreen.value = consumer;
    }
    const peerId = consumer.appData.producerClientId as string;
    const peer = peers.value.get(peerId);
    peer!.consumers.push(consumer);
    peers.value.set(peerId, peer!);
  };

  const addPeerInfo = (peerInfo: IPeerInfo, peerId: string) => {
    if (!peers.value.has(peerId)) {
      peers.value.set(peerId, {
        consumers: [],
        peerInfo,
      });
    }
  };

  const updateConsumerState = (
    peerId: string,
    producerId: string,
    state: 'on' | 'off',
  ) => {
    const peer = peers.value.get(peerId);
    peer?.consumers.forEach((consumer) => {
      if (consumer.producerId === producerId) {
        state === 'on' ? consumer.resume() : consumer.pause();
      }
    });
  };

  const removePeer = (producerClientId: string) => {
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
    presenterScreen,
    addPeerConsumer,
    removePeer,
    destroyPeers,
    addPeerInfo,
    updateConsumerState,
  };
});
