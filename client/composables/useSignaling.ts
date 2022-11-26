import { useWebsocket } from '~~/stores/useWebsocket';

export function useSignaling() {
  const socketStore = useWebsocket();

  const signalMediaStateChanged = (
    producerId: string,
    status: 'on' | 'off',
  ) => {
    socketStore.socket!.emit('media-state-changed', { producerId, status });
  };

  return {
    signalMediaStateChanged,
  };
}
