import { defineStore } from 'pinia';

export const useUserInfo = defineStore('userInfo', () => {
  const name = ref('Anonymous');

  return {
    name,
  };
});
