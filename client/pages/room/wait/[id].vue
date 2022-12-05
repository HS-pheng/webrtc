<template>
  <div>
    <div v-if="listing">
      <CommonCardHeader :title="listing?.title" class="mb-4">
        <CommonButton @click="backNavigation"> Back </CommonButton>
      </CommonCardHeader>

      <div>
        <p>This is waiting room</p>
        <p v-if="candidateListSize">
          Your position in the queue is {{ candidateListNumber }}/{{
            candidateListSize
          }}
        </p>
      </div>
    </div>
    <div v-else>Loading</div>
  </div>
</template>

<script setup lang="ts">
import { useWaitingStore } from '../../../stores/useWaitingStore';
import { ListingInfo } from '../../../constants/types';

const route = useRoute();
const router = useRouter();
const { connected } = useSocketConnection();
const interviewManager = useInterviewManager();
const waitingStore = useWaitingStore();

const joinWaitRoom = () => {
  interviewManager.joinGroup('candidate');
};

const candidateListNumber = computed(() => waitingStore.stats?.listNumber);
const candidateListSize = computed(() => waitingStore.stats?.candidateListSize);

const listing = ref<ListingInfo | null>(null);

onMounted(async () => {
  listing.value = await $fetch<any>(
    `http://localhost:3001/listings/${route.params.id}`,
  );
});

whenever(connected, joinWaitRoom, { immediate: true });
onUnmounted(() => interviewManager.leaveWaitingList());

function backNavigation() {
  router.push(`/listings/${route.params.id}`);
  interviewManager.leaveWaitingList();
}
</script>
