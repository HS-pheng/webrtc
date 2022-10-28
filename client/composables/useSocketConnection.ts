import { useWebsocket } from '~~/stores/useWebsocket';

export function useSocketConnection() {
  const socketStore = useWebsocket();
  const socket = ref(socketStore.socket);
  const connected = ref(socketStore.connected);

  tryOnMounted(() => {
    if (!connected.value) {
      socket.value?.disconnect();
      socketStore.connect();
    }
  });

  return { socket, connected };
}
