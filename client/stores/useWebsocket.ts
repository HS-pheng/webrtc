import { defineStore } from 'pinia';
import { io } from 'socket.io-client';
import { SocketPromise, makeSocketPromise } from '~~/utils/socket-promise';

export const useWebsocket = defineStore('socket', () => {
  const { $msManager } = useNuxtApp();

  const socketPromise = ref<SocketPromise | null>(null);
  const connected = ref<boolean>(false);

  const connect = (handshakeData: { name: string }) => {
    const socket = io('http://localhost:3001', {
      autoConnect: false,
      query: {
        name: handshakeData.name,
      },
    });
    socketPromise.value = makeSocketPromise(socket);
    socket.on('connect', () => {
      console.log('connected: ', socket.id);
      connected.value = true;
    });
    socket.connect();
    $msManager.socketInit(socket as SocketPromise);
  };

  return {
    socket: socketPromise,
    connect,
    connected,
  };
});
