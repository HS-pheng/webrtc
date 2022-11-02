<template>
  <div>
    <p>This is waiting room</p>
    <p v-if="candidateListSize">
      Your position in the queue is {{ candidateListNumber }}/{{
        candidateListSize
      }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { useWaitingStore } from '../../stores/useWaitingStore';

const interviewManager = useInterviewManager();
const waitingStore = useWaitingStore();
const { connected } = useSocketConnection();

const joinWaitRoom = () => {
  interviewManager.joinGroup('candidate');
};

const candidateListNumber = computed(() => waitingStore.stats?.listNumber);
const candidateListSize = computed(() => waitingStore.stats?.candidateListSize);

whenever(connected, joinWaitRoom, { immediate: true });
</script>
