<template>
  <div class="flex flex-col items-center w-[400px] mx-auto my-20 border-2">
    <video></video>
    <button @click="send">Send</button>
    <button>Receive</button>
  </div>
</template>

<script setup lang="ts">
import { useMsManager } from '../stores/useMsManager';

const { msManager } = useMsManager();
msManager.test().then((res) => {
  console.log(res);
});

const send: any = () => {
  const setUpMode = 'send';
  msManager.init(setUpMode);
};

// call init
// call createProducer or createConsumer
// createProducer send the local video to remote
// createConsumer receives the remote video stream
</script>
