import { defineStore } from 'pinia';
import { candidateStats } from '~~/constants/types';

export const useWaitingStore = defineStore('waiting-store', () => {
  const stats = ref<candidateStats | null>(null);

  const updateStats = (newStats: candidateStats) => {
    console.log('stats updated');
    stats.value = newStats;
  };

  return {
    stats,
    updateStats,
  };
});
