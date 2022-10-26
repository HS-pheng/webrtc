import { defineStore } from 'pinia';
import { io } from 'socket.io-client';
import { SocketPromise, makeSocketPromise } from '~~/utils/socket-promise';

export const useWebsocket = defineStore('socket', () => {
  const { $msManager } = useNuxtApp();
  const socketPromise = ref<SocketPromise | null>(null);

  const connect = () => {
    const socket = io('http://localhost:3001', { autoConnect: false });
    socketPromise.value = makeSocketPromise(socket);
    socket.connect();
    $msManager.socketInit(socket as SocketPromise);
    attachSocketEventListener(socket);
  };

  const attachSocketEventListener = (socket) => {
    socket.on('producer-closed', () => {
      $msManager.consumer.close();
      console.log('consumer closed');
    });
  };
  return {
    socket: socketPromise,
    connect,
  };
});
