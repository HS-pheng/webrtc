<template>
  <div>
    <div v-if="listing">
      <CommonCardHeader :title="listing?.title" class="mb-4">
        <CommonButton @click="$router.push(`/listings/${$route.params.id}`)">
          Back
        </CommonButton>
      </CommonCardHeader>
      <CommonInputGroup
        v-model="name"
        name="Name"
        type="text"
        class="w-200px"
      />
      <CommonButton v-if="!hostMode" @click="joinWaitingList"
        >Join Waiting List</CommonButton
      >
      <CommonButton v-if="!hostMode" @click="enterHostMode"
        >Enter Host Mode</CommonButton
      >
      <div v-else class="flex">
        <CommonButton>Start Session</CommonButton>
        <CommonButton>Stop Session</CommonButton>
        <CommonButton v-if="currentParticipant"
          >Conclude Participant Pitch</CommonButton
        >
        <CommonButton v-else-if="numWaitingParticipants > 0"
          >Next Participant</CommonButton
        >
        <p class="ml-auto">
          {{ 'Currently Waiting: ' + numWaitingParticipants }}
        </p>
      </div>
    </div>
    <div v-else>Loading</div>
  </div>
</template>

<script setup lang="ts">
import { useHandshakePayload } from '~~/stores/useHandshakePayload';

const { disconnectSocket } = useSocketConnection();
const handshakePayload = useHandshakePayload();
const route = useRoute();

const newListing = ref({
  title: '',
  description: '',
});

const listing = ref(null);
const name = ref('');

watch(name, handleNameChange);

function handleNameChange(name: string) {
  handshakePayload.username = name;
}

onMounted(() => {
  handshakePayload.username = 'Anonymous';
  disconnectSocket();
});

onMounted(async () => {
  listing.value = await $fetch<any>(
    `http://localhost:3001/listings/${route.params.id}`,
  );
});

// Just for simplicity reason is enabled at all times. It should obviously not be possible for anyone to enter HostMode
const hostMode = ref(false);
const currentParticipant = ref();
const numWaitingParticipants = ref(1);

function joinWaitingList() {
  handshakePayload.isInterviewer = 'false';
  return navigateTo(`/room/wait/${route.params.id}`);
}

function enterHostMode() {
  hostMode.value = true;
  return navigateTo({
    path: `/room/interview/${route.params.id}`,
    query: {
      interviewer: 'true',
    },
  });
}
</script>
