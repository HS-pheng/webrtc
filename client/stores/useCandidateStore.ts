import { defineStore } from 'pinia';

export const useCandidateStore = defineStore('candidateStore', () => {
  const candidateList = ref<string[]>([]);
  const currentCandidate = ref<string>();

  const init = (candidates: string[]) => {
    console.log(candidates);
    candidateList.value = candidates;
  };

  const push = (newCandidate: string) => {
    candidateList.value.push(newCandidate);
  };

  const remove = (candidate: string) => {
    const index = candidateList.value.indexOf(candidate);
    if (index >= 0) {
      candidateList.value.splice(index, 1);
    }
    if (candidate === currentCandidate.value) {
      currentCandidate.value = '';
    }
  };

  const shift = () => {
    candidateList.value.shift();
  };

  const front = () => {
    return candidateList.value[0];
  };

  return {
    candidateList,
    currentCandidate,
    init,
    push,
    remove,
    shift,
    front,
  };
});
