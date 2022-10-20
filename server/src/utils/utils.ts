import { WebRtcTransport } from 'mediasoup/node/lib/WebRtcTransport';

export const extractTransportData = (transport: WebRtcTransport) => {
  if (!transport) return undefined;
  return {
    id: transport.id,
    iceParameters: transport.iceParameters,
    iceCandidates: transport.iceCandidates,
    dtlsParameters: transport.dtlsParameters,
  };
};
