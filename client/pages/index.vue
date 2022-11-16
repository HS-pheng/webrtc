<template>
  <div class="flex flex-col gap-4 m-4">
    <div class="flex gap-3">
      <label>Name</label>
      <input class="border-2" @change="onNameChange" />
    </div>
    <div class="flex gap-4">
      <button class="p-2 border-2 w-50" @click="joinAsInterviewer">
        Join Room as an Interviewer
      </button>
      <button class="p-2 border-2 w-50" @click="joinAsCandidate">
        Join Room as a Candidate
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useHandshakePayload } from '@@/stores/useHandshakePayload';
const handshakePayload = useHandshakePayload();

const joinAsInterviewer: any = () => {
  return navigateTo({
    path: '/room/interview',
    query: {
      interviewer: 'true',
    },
  });
};

const joinAsCandidate: any = () => {
  return navigateTo('/room/wait');
};

const onNameChange = (event) => {
  handshakePayload.username = event.target.value;
};
</script>
