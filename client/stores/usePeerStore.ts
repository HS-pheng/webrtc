import { defineStore } from 'pinia';
import { IPeerTracks } from '~~/constants/types';

export const usePeerStore = defineStore('peerStore', () => {
  // peerId => PeerTracks
  const peers = ref(new Map<string, IPeerTracks>());

  const addPeer = (consumer, producerClientId) => {
    let peerTracks = peers.value.get(producerClientId);
    if (!peerTracks) {
      peerTracks = {
        video: undefined,
        audio: undefined,
      };
    }
    peerTracks[consumer.track.kind] = consumer.track;
    peers.value.set(producerClientId, peerTracks);
  };

  const removePeer = (producerClientId) => {
    peers.value.delete(producerClientId);
  };

  return {
    peers,
    addPeer,
    removePeer,
  };
});
