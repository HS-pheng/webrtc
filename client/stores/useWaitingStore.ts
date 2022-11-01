import { defineStore } from 'pinia';

export const useWaitingStore = defineStore('waiting-store', () => {
  const stats = ref(null);

  const updateStats = (newStats) => {
    console.log('stats updated');
    stats.value = newStats;
  };

  return {
    stats,
    updateStats,
  };
});
