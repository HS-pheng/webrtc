import { defineStore } from 'pinia';

export const useHandshakePayload = defineStore('handshakePayload', () => {
  const username = ref('Anonymous');
  const isInterviewer = ref('');

  return {
    username,
    isInterviewer,
  };
});
