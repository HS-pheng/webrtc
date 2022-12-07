<template>
  <div>
    <p class="cursor-pointer m-auto" @click="showListDetails = true">
      Currently Waiting: {{ candidateList.length }} | {{ currentCandidateName }}
    </p>

    <CommonModal v-model="showListDetails" title="Candidate lists:">
      <ul>
        <p v-if="candidateList.length === 0">No candidate</p>
        <div>
          <li v-for="(candidate, index) in candidateList" :key="candidate.id">
            {{ index + 1 }}. {{ candidate.username }}
          </li>
        </div>
      </ul>
    </CommonModal>
  </div>
</template>

<script setup lang="ts">
import { EMPTY_CANDIDATE } from '~~/constants/constant';
import { candidateInfo } from '~~/constants/types';

const props = defineProps<{
  candidateList: candidateInfo[];
  currentCandidate: candidateInfo;
}>();

const showListDetails = ref(false);
const candidateList = computed(() => props.candidateList);
const currentCandidateName = computed(() => {
  if (props.currentCandidate.username !== EMPTY_CANDIDATE.username)
    return `Current Candidate: ${props.currentCandidate.username}`;
  return 'Currently No Participant';
});
</script>
