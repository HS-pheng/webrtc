import { defineStore } from 'pinia';
import { Socket, io } from 'socket.io-client';

export const useWebsocket = defineStore('socket', () => {
  const socket = ref<Socket | null>(null);

  const connect = () => {
    socket.value = io('http://localhost:3001', { autoConnect: false });
    socket.value.on('connect', () => {
      console.log('connected');
    });
    socket.value.connect();
  };

  const disconnect = () => {
    socket.value?.disconnect();
    socket.value = null;
  };

  return {
    socket,
    connect,
    disconnect,
  };
});
