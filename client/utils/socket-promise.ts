import { Socket } from 'socket.io-client';
export interface SocketPromise extends Socket {
  request(endpoint: string, payload: object, timeout?: number): Promise<any>;
  listen(endpoint: string, timeout?: number): Promise<any>;
}

export function makeSocketPromise(
  socket: Socket,
  requestTimeout = 10000,
): SocketPromise {
  const socketPromise = socket as SocketPromise;
  socketPromise.request = (
    endpoint: string,
    payload: object,
    timeout: number = requestTimeout,
  ) => {
    return new Promise((resolve, reject) => {
      setTimeout(
        () => reject(new Error(`Timeout! called endpoint: ${endpoint}`)),
        timeout,
      );
      socket.emit(endpoint, payload, (res: any) => {
        resolve(res);
      });
    });
  };
  return socketPromise;
}
