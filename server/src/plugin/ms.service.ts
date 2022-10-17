import { mediaCodecs } from './../config';
import { Injectable } from '@nestjs/common';
// import { CoreService } from './core.service';
import { Worker } from 'mediasoup/node/lib/Worker';
import { Router } from 'mediasoup/node/lib/Router';
import { createWorker } from 'mediasoup';

@Injectable()
export class MsService {
  //   constructor(private coreService: CoreService) {}

  private sendTransport = null;
  private producer;
  private consumer;
  private recvTransport = null;

  private worker: Worker;
  private router: Router;
  async onModuleInit() {
    this.worker = await createWorker({
      rtcMinPort: 40000,
      rtcMaxPort: 40020,
      logLevel: 'debug',
      logTags: ['info', 'ice', 'dtls', 'rtp', 'srtp', 'rtcp', 'rtx'],
    });
    this.router = await this.worker.createRouter({ mediaCodecs });
  }

  getRouterRTPCapabilities() {
    return this.router.rtpCapabilities;
  }

  async transportSetUp(setUpMode) {
    console.log({ setUpMode });
    switch (setUpMode) {
      case 'send':
        this.sendTransport = await this.router.createWebRtcTransport({
          listenIps: [
            {
              ip: '0.0.0.0',
              announcedIp: '127.0.0.1',
            },
          ],
          enableTcp: true,
        });
        break;
      case 'recv':
        this.recvTransport = await this.router.createWebRtcTransport({
          listenIps: [
            {
              ip: '0.0.0.0',
              announcedIp: '127.0.0.1',
            },
          ],
          enableTcp: true,
        });
        break;
    }
    const res = {
      rtpCapabilities: this.router.rtpCapabilities,
      recvTrasnport: {
        id: this.recvTransport?.id,
        iceParameters: this.recvTransport?.iceParameters,
        iceCandidates: this.recvTransport?.iceCandidates,
        dtlsParameters: this.recvTransport?.dtlsParameters,
      },
      sendTransport: {
        id: this.sendTransport?.id,
        iceParameters: this.sendTransport?.iceParameters,
        iceCandidates: this.sendTransport?.iceCandidates,
        dtlsParameters: this.sendTransport?.dtlsParameters,
      },
    };
    console.log(res.rtpCapabilities);
    return res;
  }

  // store transports, producer, consumer
  // consume coreservice
}
