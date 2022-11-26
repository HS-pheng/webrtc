<template>
  <div class="flex justify-center mt-10px gap-30px">
    <Icon
      :name="mic[deviceState.audio as keyof typeof mic]"
      size="50px"
      @click="toggleState(MEDIA_DEVICE_TYPE.AUDIO)"
    />
    <Icon
      :name="cam[deviceState.video as keyof typeof cam]"
      size="50px"
      @click="toggleState(MEDIA_DEVICE_TYPE.VIDEO)"
    />
    <Icon
      :name="screen[deviceState.display as keyof typeof screen]"
      size="50px"
      @click="toggleState(MEDIA_DEVICE_TYPE.DISPLAY)"
    />
    <Icon
      name="material-symbols:call-end-outline"
      size="50px"
      @click="handleLeaveCall"
    />
  </div>
</template>

<script lang="ts" setup>
const emit = defineEmits(['mediaStateChange', 'leaveCall']);

const MEDIA_DEVICE_TYPE = {
  AUDIO: 'audio',
  VIDEO: 'video',
  DISPLAY: 'display',
};

const mic = {
  on: 'material-symbols:mic-outline',
  off: 'material-symbols:mic-off-outline',
};

const cam = {
  on: 'material-symbols:video-camera-front-outline',
  off: 'material-symbols:video-camera-front-off-outline',
};

const screen = {
  on: 'lucide:screen-share',
  off: 'lucide:screen-share-off',
};

const deviceState = ref({
  audio: 'on',
  video: 'on',
  display: 'off',
});

const toggleState = (deviceType: string) => {
  deviceState.value[deviceType as keyof typeof deviceState.value] =
    deviceState.value[deviceType as keyof typeof deviceState.value] === 'on'
      ? 'off'
      : 'on';

  emit(
    'mediaStateChange',
    deviceType,
    deviceState.value[deviceType as keyof typeof deviceState.value],
  );
};

const handleLeaveCall = () => {
  emit('leaveCall');
  return navigateTo('/');
};
</script>
