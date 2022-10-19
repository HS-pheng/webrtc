import { ProducerOptions } from 'mediasoup-client/lib/Producer';

export const producerOptions: ProducerOptions = {
  encodings: [
    { maxBitrate: 100000 },
    { maxBitrate: 300000 },
    { maxBitrate: 900000 },
  ],
  codecOptions: {
    videoGoogleStartBitrate: 1000,
  },
};
