<template>
  <div>
    <ListingsList :items="listings" @create="showCreateDialog = true" />
    <CommonModal
      v-model="showCreateDialog"
      title="Create New Listing"
      confirm-text="Create"
      @submit="onCreate"
    >
      <CommonInputGroup v-model="newListing.title" name="Title" type="text" />
      <CommonInputGroup
        v-model="newListing.description"
        name="Description"
        type="text"
      />
    </CommonModal>
  </div>
</template>

<script setup lang="ts">
const listings = ref([]);
const showCreateDialog = ref(false);

const newListing = ref({
  title: '',
  description: '',
});

async function onCreate() {
  const data = await $fetch<any[]>('http://localhost:3001/listings', {
    body: newListing.value,
    method: 'post',
  });
  listings.value.push(data);
}

onMounted(async () => {
  const data = await $fetch<any[]>('http://localhost:3001/listings');
  listings.value = data;
});
</script>
