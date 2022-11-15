import { defineStore } from 'pinia';

export const useHandshakePayload = defineStore('handshakePayload', () => {
  const username = ref('Anonymous');

  return {
    username,
  };
});
