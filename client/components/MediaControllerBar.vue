<template>
  <div class="flex justify-center mt-10px gap-30px">
    <Icon
      :name="mic[deviceState.mic as keyof typeof mic]"
      size="50px"
      @click="toggleState(MEDIA_DEVICE_TYPE.MIC)"
    />
    <Icon
      :name="cam[deviceState.cam as keyof typeof cam]"
      size="50px"
      @click="toggleState(MEDIA_DEVICE_TYPE.CAM)"
    />
    <Icon
      :name="screen[deviceState.screen as keyof typeof screen]"
      size="50px"
      @click="toggleState(MEDIA_DEVICE_TYPE.SCREEN)"
    />
    <Icon name="material-symbols:call-end-outline" size="50px" />
  </div>
</template>

<script lang="ts" setup>
const MEDIA_DEVICE_TYPE = {
  MIC: 'mic',
  CAM: 'cam',
  SCREEN: 'screen',
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
  mic: 'on',
  cam: 'on',
  screen: 'off',
});

const toggleState = (deviceType: string) => {
  deviceState.value[deviceType as keyof typeof deviceState.value] =
    deviceState.value[deviceType as keyof typeof deviceState.value] === 'on'
      ? 'off'
      : 'on';
};
</script>
