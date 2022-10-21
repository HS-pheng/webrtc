import { defineStore } from 'pinia';
import { io } from 'socket.io-client';
import { SocketPromise, makeSocketPromise } from '~~/utils/socket-promise';

export const useWebsocket = defineStore('socket', () => {
  const socket = io('http://localhost:3001', { autoConnect: false });

  const connect = () => {
    socket.connect();
  };

  const socketPromise: SocketPromise = makeSocketPromise(socket);
  return {
    socketPromise,
    connect,
  };
});
