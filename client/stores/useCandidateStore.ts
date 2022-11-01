import { defineStore } from 'pinia';

export const useCandidateStore = defineStore('candidateStore', () => {
  const candidateList = ref<string[]>([]);
  const currentCandidate = ref<string>();

  const init = (candidates) => {
    console.log(candidates);
    candidateList.value = candidates;
  };

  const push = (newCandidate) => {
    candidateList.value.push(newCandidate);
  };

  const remove = (name) => {
    const index = candidateList.value.indexOf(name);
    if (index >= 0) {
      candidateList.value.splice(index, 1);
    }
    if (name === currentCandidate.value) {
      currentCandidate.value = '';
    }
  };

  const pop = () => {
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
    pop,
    front,
  };
});
