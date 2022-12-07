<template>
  <div class="flex gap-30px">
    <CommonButton v-if="!timerStarted" @click="startTimer"
      >Start timer</CommonButton
    >
    <p class="m-auto">Remaining time {{ timer }}</p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  duration: number;
}>();

const emit = defineEmits(['timer-finished']);

const interviewEventListener = useEventBus('interviewEvents');
attachInterviewEventListener();

const timerStarted = ref(false);
const duration = ref(props.duration);
const timer = computed(() => {
  const minutes = Math.floor(duration.value / 60);
  const seconds = duration.value - minutes * 60;

  return `${minutes}:${seconds}`;
});

function count() {
  if (--duration.value) {
    setTimeout(() => {
      count();
    }, 1000);
  } else {
    emit('timer-finished');
    duration.value = props.duration;
    timerStarted.value = false;
  }
}

function startTimer() {
  timerStarted.value = true;
  count();
}

function attachInterviewEventListener() {
  interviewEventListener.on((event) => {
    if (event === 'reset-timer') {
      duration.value = props.duration;
    }
  });
}
</script>
