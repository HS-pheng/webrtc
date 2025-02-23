import { config } from 'dotenv';
config();
import { WorkerSettings } from 'mediasoup/node/lib/Worker';
import { RtpCodecCapability } from 'mediasoup/node/lib/RtpParameters';

export const portRange = {
  minPort: 40000,
  maxPort: 40020,
};

export const listenIps = [
  {
    ip: '0.0.0.0',
    announcedIp: process.env.ANNOUNCED_IP,
  },
];

export const workerSettings: WorkerSettings = {
  rtcMinPort: 40000,
  rtcMaxPort: 40020,
  logLevel: 'debug',
  logTags: ['info', 'ice', 'dtls', 'rtp', 'srtp', 'rtcp', 'rtx'],
};

export const mediaCodecs: RtpCodecCapability[] = [
  {
    kind: 'audio',
    mimeType: 'audio/opus',
    clockRate: 48000,
    channels: 2,
  },
  {
    kind: 'video',
    mimeType: 'video/VP8',
    clockRate: 90000,
    parameters: {
      'x-google-start-bitrate': 1000,
    },
  },
  {
    kind: 'video',
    mimeType: 'video/VP9',
    clockRate: 90000,
    parameters: {
      'profile-id': 2,
      'x-google-start-bitrate': 1000,
    },
  },
  {
    kind: 'video',
    mimeType: 'video/H264',
    clockRate: 90000,
    parameters: {
      'packetization-mode': 1,
      'profile-level-id': '4d001f',
      'level-asymmetry-allowed': 1,
      'x-google-start-bitrate': 1000,
    },
  },
  {
    kind: 'video',
    mimeType: 'video/h264',
    clockRate: 90000,
    parameters: {
      'packetization-mode': 1,
      'profile-level-id': '42e01f',
      'level-asymmetry-allowed': 1,
      'x-google-start-bitrate': 1000,
    },
  },
];
