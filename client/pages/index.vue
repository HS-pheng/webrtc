<template>
  <div class="flex flex-col gap-4 m-4">
    <div class="flex gap-3">
      <label>Name</label>
      <input class="border-2" />
    </div>
    <div class="flex gap-4">
      <button class="p-2 border-2 w-50" @click="joinRoom">
        Join Room as an Interviewer
      </button>
      <button class="p-2 border-2 w-50" @click="joinRoom">
        Join Room as a Candidate
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWebsocket } from '~~/stores/useWebsocket';

const ws = useWebsocket();

const joinRoom: any = () => {
  navigateTo('/room');
};

onMounted(() => {
  ws.connect();
});
</script>
