import { useWebsocket } from '~~/stores/useWebsocket';

export function useSignaling() {
  const socketStore = useWebsocket();

  const signalMediaStateChanged = (producerId: string, state: 'on' | 'off') => {
    socketStore.socket!.emit('media-state-changed', { producerId, state });
  };

  const signalStopSharing = (displayProducerId: string) => {
    socketStore.socket!.emit('stop-sharing', displayProducerId);
  };

  return {
    signalMediaStateChanged,
    signalStopSharing,
  };
}
