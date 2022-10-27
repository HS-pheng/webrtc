<template>
  <div>
    <div v-if="listing">
      <CommonCardHeader :title="listing.title" class="mb-4">
        <CommonButton @click="$router.push(`/listings/${$route.params.id}`)">
          Back
        </CommonButton>
      </CommonCardHeader>
      <CommonButton v-if="!hostMode" @click="joinWaitingList"
        >Join Waiting List</CommonButton
      >
      <CommonButton v-if="!hostMode" @click="hostMode = true"
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
      <div class="flex w-full p-4">
        <div class="flex flex-col w-1/2">
          <video class="w-full bg-black" />
          <p class="text-xs text-center">Local Video</p>
        </div>
        <div class="bg-white w-1" />
        <div class="flex flex-col w-1/2">
          <video v-if="currentParticipant" class="w-full bg-black" />
          <p v-else class="text-center my-auto">Currently No Participant</p>
          <p class="text-xs text-center">Remote Video</p>
        </div>
      </div>
    </div>
    <div v-else>Loading</div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();

const listing = ref(null);

onMounted(async () => {
  listing.value = await $fetch<any>(
    `http://localhost:3001/listings/${route.params.id}`,
  );
});

// Just for simplicity reason is enabled at all times. It should obviously not be possible for anyone to enter HostMode
const hostMode = ref(false);
const currentParticipant = ref(false);
const numWaitingParticipants = ref(0);

function joinWaitingList() {
  // Do some stuff
}
</script>
