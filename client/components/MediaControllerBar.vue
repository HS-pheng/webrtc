<template>
  <div class="flex justify-center mt-10px gap-30px">
    <Icon
      class="cursor-pointer"
      :name="mic[deviceState.audio]"
      size="45px"
      @click="toggleState(MEDIA_DEVICE_TYPE.AUDIO)"
    />
    <Icon
      class="cursor-pointer"
      :name="cam[deviceState.video]"
      size="45px"
      @click="toggleState(MEDIA_DEVICE_TYPE.VIDEO)"
    />
    <Icon
      class="cursor-pointer"
      :name="screen[deviceState.display]"
      size="45px"
      @click="toggleState(MEDIA_DEVICE_TYPE.DISPLAY)"
    />
    <Icon
      class="cursor-pointer"
      name="material-symbols:call-end-outline"
      size="45px"
      @click="handleLeaveCall"
    />
  </div>
</template>

<script lang="ts" setup>
const emit = defineEmits(['mediaStateChange', 'leaveCall']);

const deviceState = ref<Record<string, 'on' | 'off'>>({
  audio: 'on',
  video: 'on',
  display: 'off',
});

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

const toggleState = (deviceType: keyof typeof deviceState.value) => {
  deviceState.value[deviceType] =
    deviceState.value[deviceType] === 'on' ? 'off' : 'on';

  emit('mediaStateChange', deviceType, deviceState.value[deviceType]);
};

const handleLeaveCall = () => {
  emit('leaveCall');
  return navigateTo('/');
};
</script>
