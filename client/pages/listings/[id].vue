<template>
  <div>
    <div v-if="listing">
      <CommonCardHeader :title="listing?.title">
        <CommonButton @click="$router.push(`/listings/live/${listing?.id}`)">
          Join
        </CommonButton>
        <CommonButton @click="$router.push('/')"> Back </CommonButton>
      </CommonCardHeader>
      <div class="p-4 mt-2">
        {{ listing.description }}
      </div>
    </div>
    <div v-else>Loading</div>
  </div>
</template>

<script setup lang="ts">
import { ListingInfo } from '~~/constants/types';

const route = useRoute();

const listing = ref<ListingInfo | null>(null);

onMounted(async () => {
  listing.value = await $fetch<any>(
    `http://localhost:3001/listings/${route.params.id}`,
  );
});
</script>
