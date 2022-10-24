import { defineStore } from 'pinia';
import { io } from 'socket.io-client';
import { SocketPromise, makeSocketPromise } from '~~/utils/socket-promise';

export const useWebsocket = defineStore('socket', () => {
  const { $msManager } = useNuxtApp();
  const socket = io('http://localhost:3001', { autoConnect: false });

  const connect = () => {
    console.log('socket connected');
    socket.connect();
    attachSocketEventListener(socket);
  };

  const attachSocketEventListener = (socket) => {
    socket.on('producer-closed', () => {
      $msManager.consumer.close();
      console.log('consumer closed');
    });
  };

  const socketPromise: SocketPromise = makeSocketPromise(socket);
  return {
    socketPromise,
    connect,
  };
});
