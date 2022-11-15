import { defineStore } from 'pinia';

export const useUserInfo = defineStore('userInfo', () => {
  const username = ref('Anonymous');

  return {
    username,
  };
});
