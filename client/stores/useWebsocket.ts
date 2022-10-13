import { defineStore } from 'pinia';
import { Socket, io } from 'socket.io-client';

export const useWebsocket = defineStore('socket', () => {
  const socket = ref<Socket | null>(null);
  const connected = ref(false);

  const connect = () => {
    socket.value = io('http://localhost:3001', { autoConnect: false });
    socket.value.on('connect', () => {
      console.log('socket connected');
      connected.value = true;
    });
    ['joined', 'left'].forEach((event) => {
      socket.value.on(event, (socketIds) => {
        console.log('Sockets in the room', socketIds);
      });
    });

    socket.value.connect();
  };

  const disconnect = () => {
    socket.value?.disconnect();
    connected.value = false;
    socket.value = null;
  };

  return {
    socket,
    connected,
    connect,
    disconnect,
  };
});
