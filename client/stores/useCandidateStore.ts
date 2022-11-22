import { defineStore } from 'pinia';
import { EMPTY_CANDIDATE } from '~~/constants/constant';
import { candidateInfo } from '~~/constants/types';

export const useCandidateStore = defineStore('candidateStore', () => {
  const candidateList = ref<candidateInfo[]>([]);
  const currentCandidate = ref<candidateInfo>(EMPTY_CANDIDATE);

  const init = (candidates: candidateInfo[]) => {
    candidateList.value = candidates;
  };

  const push = (newCandidate: candidateInfo) => {
    candidateList.value.push(newCandidate);
  };

  const remove = (candidateId: string) => {
    const index = candidateList.value.findIndex(
      (candidate) => candidate.id === candidateId,
    );

    if (index >= 0) {
      candidateList.value.splice(index, 1);
    }
  };

  const shift = () => {
    candidateList.value.shift();
  };

  const front = () => {
    return candidateList.value[0];
  };

  const size = () => {
    return candidateList.value.length;
  };

  const removeCurrentCandidate = () => {
    currentCandidate.value = EMPTY_CANDIDATE;
  };

  return {
    candidateList,
    currentCandidate,
    init,
    push,
    remove,
    shift,
    front,
    size,
    removeCurrentCandidate,
  };
});
