import { MsManager } from '../utils/mediasoup.manager';

export default defineNuxtPlugin(() => {
  const msManager = new MsManager();
  return {
    provide: {
      msManager,
    },
  };
});
