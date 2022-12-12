export function useLocalMedia() {
  const videoTrack = ref<MediaStreamTrack | null>(null);
  const audioTrack = ref<MediaStreamTrack | null>(null);
  const displayTrack = ref<MediaStreamTrack | null>(null);

  const getMedia = async (type: 'both' | 'audio' | 'video' | 'display') => {
    if (type === 'audio' || type === 'both') {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      audioTrack.value = stream.getAudioTracks()[0];
    }

    if (type === 'video' || type === 'both') {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      videoTrack.value = stream.getVideoTracks()[0];
    }

    if (type === 'display') {
      const stream = await navigator.mediaDevices.getDisplayMedia();
      displayTrack.value = stream.getVideoTracks()[0];
    }
  };

  const stopMedia = (type: 'both' | 'audio' | 'video' | 'display') => {
    if (type === 'audio' || type === 'both') {
      audioTrack.value?.stop();
    }

    if (type === 'video' || type === 'both') {
      videoTrack.value?.stop();
    }

    if (type === 'display') {
      displayTrack.value?.stop();
      displayTrack.value = null;
    }
  };

  return { videoTrack, audioTrack, displayTrack, getMedia, stopMedia };
}
