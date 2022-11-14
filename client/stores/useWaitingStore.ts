import { defineStore } from 'pinia';
import { candidateStats } from '~~/constants/types';

export const useWaitingStore = defineStore('waiting-store', () => {
  const stats = ref<candidateStats | null>(null);

  const updateStats = (newStats: candidateStats) => {
    stats.value = newStats;
  };

  return {
    stats,
    updateStats,
  };
});
