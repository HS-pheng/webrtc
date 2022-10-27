<template>
  <div>
    <CommonCardHeader
      title="All Listings"
      action-text="Create"
      @click="$emit('create')"
    >
      <CommonButton type="button" @click="$emit('create')">
        Create
      </CommonButton>
    </CommonCardHeader>
    <div class="overflow-hidden bg-white shadow sm:rounded-md">
      <ul role="list" class="divide-y divide-gray-200">
        <li v-for="item in items" :key="item.title">
          <NuxtLink :to="`/listings/${item.id}`" class="block hover:bg-gray-50">
            <div class="flex items-center px-4 py-4 sm:px-6">
              <div class="flex min-w-0 flex-1 items-center">
                <div
                  class="min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4"
                >
                  <div>
                    <p class="truncate text-sm font-medium text-indigo-600">
                      {{ item.title }}
                    </p>
                    <p class="line-clamp-2 text-sm mt-2">
                      {{ item.description }}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <Icon name="ic:baseline-arrow-forward-ios" />
              </div>
            </div>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  items: any[];
}>();

defineEmits(['create']);
</script>
