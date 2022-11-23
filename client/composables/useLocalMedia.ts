export function useLocalMedia() {
  const videoTrack = ref<MediaStreamTrack | null>(null);
  const audioTrack = ref<MediaStreamTrack | null>(null);

  const getMedia = async (type: 'both' | 'audio' | 'video') => {
    if (type === 'both') {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      videoTrack.value = stream.getVideoTracks()[0];
      audioTrack.value = stream.getAudioTracks()[0];
    } else if (type === 'audio') {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      audioTrack.value = stream.getAudioTracks()[0];
    } else if (type === 'video') {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      videoTrack.value = stream.getVideoTracks()[0];
    }
  };

  const stopMedia = (type: 'both' | 'audio' | 'video') => {
    if (type === 'audio') {
      audioTrack.value?.stop();
      return;
    }

    if (type === 'video') {
      videoTrack.value?.stop();
      return;
    }

    videoTrack.value?.stop();
    audioTrack.value?.stop();
  };

  return { videoTrack, audioTrack, getMedia, stopMedia };
}
