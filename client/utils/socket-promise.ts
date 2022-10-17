import { Socket } from 'socket.io-client';
export interface SocketPromise extends Socket {
  request(endpoint: string, payload: object, timeout?: number): Promise<any>;
}

export function makeSocketPromise(
  socket: Socket,
  requestTimeout: number = 10000,
): SocketPromise {
  const socketPromise = socket as SocketPromise;
  socketPromise.request = (
    endpoint: string,
    payload: object,
    timeout: number = requestTimeout,
  ) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => reject(new Error('Timeout!')), timeout);
      socket.emit(endpoint, payload, (res) => {
        console.log('got res');
        resolve(res);
      });
    });
  };
  return socketPromise;
}
