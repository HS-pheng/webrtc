<template>
  <div class="flex flex-col items-center w-[400px] mx-auto my-20 border-2">
    <h1>Socket connected: {{ ws.connected }}</h1>
    <h2>Socket ID: {{ id }}</h2>
  </div>
</template>

<script setup lang="ts">
import { useWebsocket } from '../stores/useWebsocket';

definePageMeta({
  layout: 'default',
});

const ws = useWebsocket();

onMounted(() => {
  ws.connect();
});

watch(
  () => ws.connected,
  (value) => {
    if (value) {
      ws.socket.emit('join', 'test');
    }
  },
);

const id = computed(() => ws.socket?.id || '-');
</script>
