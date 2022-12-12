<template>
  <div class="flex gap-30px">
    <CommonButton v-if="!timerStarted" @click="requestToStartTimer"
      >Start timer</CommonButton
    >
    <CommonButton v-if="!timerStarted" @click="showEditTimer = true"
      >Edit Timer</CommonButton
    >
    <p class="m-auto">Remaining time {{ timer }}</p>
    <CommonModal
      v-model="showEditTimer"
      title="Timer"
      confirm-text="Edit"
      @submit="onEditTimer"
    >
      <CommonInputGroup
        v-model="durationInString"
        name="Duration in seconds"
        type="number"
      />
    </CommonModal>
  </div>
</template>

<script setup lang="ts">
const signalingManager = useSignaling();
const route = useRoute();
const emit = defineEmits(['timerStateChanged']);

const showEditTimer = ref(false);

const interviewEventListener = useEventBus('interviewEvents');
attachInterviewEventListener();

const durationInString = ref('30');
const timerStarted = ref(false);
const defaultDuration = ref(30);
const remainingDuration = ref(defaultDuration.value);

const timer = computed(() => {
  const minutes = Math.floor(remainingDuration.value / 60);
  const seconds = remainingDuration.value - minutes * 60;

  return `${minutes}:${seconds}`;
});

function count() {
  if (!timerStarted.value) {
    return;
  }

  if (--remainingDuration.value) {
    setTimeout(() => {
      count();
    }, 1000);
  } else {
    remainingDuration.value = defaultDuration.value;
    timerStarted.value = false;
  }
}

function requestToStartTimer() {
  const roomId = route.params.id as string;
  signalingManager.signalStartTimer(defaultDuration.value, roomId);
}

function startTimer(initialTimer: number) {
  remainingDuration.value = defaultDuration.value = initialTimer;
  timerStarted.value = true;
  count();
}

function attachInterviewEventListener() {
  interviewEventListener.on((event, initialTimer) => {
    if (event === 'start-timer') {
      startTimer(initialTimer);
    }
  });
}

function onEditTimer() {
  remainingDuration.value = defaultDuration.value = Number(
    durationInString.value,
  );
}

watch(timerStarted, (timerStarted) => {
  emit('timerStateChanged', timerStarted);
});
</script>
