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
      <CommonButton @click="joinWaitingList">Join Waiting List</CommonButton>
      <CommonButton @click="enterHostMode">Enter Host Mode</CommonButton>
    </div>
    <div v-else>Loading</div>
  </div>
</template>

<script setup lang="ts">
import { ListingInfo } from '~~/constants/types';
import { useHandshakePayload } from '~~/stores/useHandshakePayload';

const { disconnectSocket } = useSocketConnection();
const handshakePayload = useHandshakePayload();
const route = useRoute();

const listing = ref<ListingInfo | null>(null);
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

function joinWaitingList() {
  handshakePayload.isInterviewer = 'false';
  return navigateTo(`/room/wait/${route.params.id}`);
}

function enterHostMode() {
  return navigateTo({
    path: `/room/interview/${route.params.id}`,
    query: {
      interviewer: 'true',
    },
  });
}
</script>
