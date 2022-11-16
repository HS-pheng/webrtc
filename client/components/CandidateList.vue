<template>
  <div class="flex">
    <div class="border-3 mt-3 mb-3 p-3 flex-grow">
      <p>Candidate list</p>
      <ul>
        <p v-if="candidateList.length === 0">No candidate</p>
        <div>
          <li v-for="(candidate, index) in candidateList" :key="candidate.id">
            {{ index + 1 }}. {{ candidate.username }}
          </li>
        </div>
      </ul>
    </div>
    <div class="border-3 mt-3 mb-3 p-3 flex-grow">
      <p>Current candidate</p>
      <p>{{ currentCandidate }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { candidateInfo } from '~~/constants/types';

const props = defineProps<{
  candidateList: candidateInfo[];
  currentCandidate: candidateInfo;
}>();

const candidateList = computed(() => props.candidateList);
const currentCandidate = computed(() => props.currentCandidate.username);
</script>
