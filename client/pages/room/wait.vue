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
// import { useWebsocket } from '~~/stores/useWebsocket';

const { connected } = useSocketConnection();
const interviewManager = useInterviewManager();
const waitingStore = useWaitingStore();
// const socketStore = useWebsocket();

const joinWaitRoom = () => {
  interviewManager.joinGroup('candidate');
};

const candidateListNumber = computed(() => waitingStore.stats?.listNumber);
const candidateListSize = computed(() => waitingStore.stats?.candidateListSize);

// const connected = computed(() => socketStore.connected);

// onMounted(trySocketConnection);
whenever(connected, joinWaitRoom, { immediate: true });
onUnmounted(() => interviewManager.leaveWaitingList());
</script>
