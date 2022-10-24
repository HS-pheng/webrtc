import { defineStore } from 'pinia';
import { io } from 'socket.io-client';
import { SocketPromise, makeSocketPromise } from '~~/utils/socket-promise';

export const useWebsocket = defineStore('socket', () => {
  const socketPromise = ref<SocketPromise | null>(null);

  const connect = () => {
    const socket = io('http://localhost:3001', { autoConnect: false });
    socketPromise.value = makeSocketPromise(socket);
    socket.connect();
  };
  return {
    socket: socketPromise,
    connect,
  };
});
