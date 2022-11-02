<template>
  <div class="flex">
    <div class="border-3 mt-3 mb-3 p-3 flex-grow">
      <p>Candidate list</p>
      <ul>
        <p v-if="candidateList.length === 0">No candidate</p>
        <div>
          <li v-for="(name, index) in candidateList" :key="name">
            {{ index + 1 }}. {{ name }}
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
import { useCandidateStore } from '~~/stores/useCandidateStore';
const candidateStore = useCandidateStore();
const candidateList = computed(() => candidateStore.candidateList);
const currentCandidate = computed(() => candidateStore.currentCandidate);
</script>
