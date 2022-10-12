<template>
  <div>{{ msg }}</div>
  <h2>Hello World!!</h2>
</template>

<script setup lang="ts">
import { useWebsocket } from '~/stores/useWebsocket';

const msg = 'Hello World!';
const { connect } = useWebsocket();

onMounted(() => {
  connect();
});
</script>
