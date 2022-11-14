export async function useLocalMedia() {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
  });
  const videoTrack = stream.getVideoTracks()[0];
  const audioTrack = stream.getAudioTracks()[0];

  return { videoTrack, audioTrack };
}
