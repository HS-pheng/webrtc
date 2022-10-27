<template>
  <div class="my-2">
    <label :for="name" class="block text-sm font-medium text-gray-700">
      {{ name }}
    </label>
    <div class="mt-1">
      <input
        :id="name"
        :type="type"
        :name="name"
        class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        :placeholder="name"
        aria-describedby="email-description"
        @change="onChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  name: string;
  type: string;
  modelValue: string;
}>();

const emit = defineEmits(['update:modelValue']);

const onChange = ($event: any) => {
  emit('update:modelValue', $event.target.value);
};
</script>
