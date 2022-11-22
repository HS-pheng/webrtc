export function useLocalMedia() {
  const videoTrack = ref<MediaStreamTrack | null>(null);
  const audioTrack = ref<MediaStreamTrack | null>(null);

  const getMedia = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    videoTrack.value = stream.getVideoTracks()[0];
    audioTrack.value = stream.getAudioTracks()[0];
  };

  const stopMedia = () => {
    videoTrack.value?.stop();
    audioTrack.value?.stop();
  };

  return { videoTrack, audioTrack, getMedia, stopMedia };
}
