import { defineStore } from 'pinia';
import { MsManager } from './../utils/mediasoup.manager';
// import { SocketPromise } from '~~/utils/socket-promise';

export const useMsManager = defineStore('msManager', () => {
  //   const msManager = new MsManager(socketPromise as SocketPromise);
  const msManager = new MsManager();
  return {
    msManager,
  };
});
