<template>
  <div
    class="border-b border-gray-200 pb-5 sm:flex sm:items-center sm:justify-between"
  >
    <h3 class="text-lg font-medium leading-6 text-gray-900">{{ title }}</h3>
    <div class="ml-auto mt-3 sm:mt-0 sm:ml-4">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
}>();
</script>
