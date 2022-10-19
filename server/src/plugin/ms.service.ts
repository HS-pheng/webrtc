import { workerSettings, mediaCodecs } from './../../config/mediasoup';
import { Injectable } from '@nestjs/common';
// import { CoreService } from './core.service';
import { Worker } from 'mediasoup/node/lib/Worker';
import { Router } from 'mediasoup/node/lib/Router';
import { createWorker } from 'mediasoup';
import {
  DtlsParameters,
  WebRtcTransport,
} from 'mediasoup/node/lib/WebRtcTransport';
import { RtpCapabilities } from 'mediasoup/node/lib/RtpParameters';
import { Producer } from 'mediasoup/node/lib/Producer';
import { Consumer } from 'mediasoup/node/lib/Consumer';
import * as mediasoup from 'mediasoup';

@Injectable()
export class MsService {
  //   constructor(private coreService: CoreService) {}

  private sendTransport: WebRtcTransport = null;
  private producer: Producer = null;
  private consumer: Consumer = null;
  private recvTransport: WebRtcTransport = null;

  private worker: Worker = null;
  private router: Router = null;

  private listenIps = [
    {
      ip: '0.0.0.0',
      announcedIp: '172.20.10.3',
    },
  ];

  async onModuleInit() {
    this.worker = await createWorker(workerSettings);
    this.router = await this.worker.createRouter({ mediaCodecs });
    this.setUpObservers();
  }

  async transportSetUp(setUpMode) {
    switch (setUpMode) {
      case 'send':
        this.sendTransport = await this.router.createWebRtcTransport({
          listenIps: this.listenIps,
        });
        break;
      case 'recv':
        this.recvTransport = await this.router.createWebRtcTransport({
          listenIps: this.listenIps,
        });
        break;
    }
    return {
      rtpCapabilities: this.router.rtpCapabilities,
      recvTransport:
        setUpMode === 'recv'
          ? {
              id: this.recvTransport?.id,
              iceParameters: this.recvTransport?.iceParameters,
              iceCandidates: this.recvTransport?.iceCandidates,
              dtlsParameters: this.recvTransport?.dtlsParameters,
            }
          : null,
      sendTransport:
        setUpMode === 'send'
          ? {
              id: this.sendTransport?.id,
              iceParameters: this.sendTransport?.iceParameters,
              iceCandidates: this.sendTransport?.iceCandidates,
              dtlsParameters: this.sendTransport?.dtlsParameters,
            }
          : null,
    };
  }

  async transportConnect(dtlsParameters: DtlsParameters) {
    try {
      await this.sendTransport.connect({ dtlsParameters });
    } catch (err) {
      return false;
    }
    return true;
  }

  async transportRecvConnect(dtlsParameters: DtlsParameters) {
    try {
      await this.recvTransport.connect({ dtlsParameters });
    } catch (err) {
      return false;
    }
    return true;
  }

  async transportProduce(payload) {
    this.producer = await this.sendTransport.produce({
      kind: payload.kind,
      rtpParameters: payload.rtpParameters,
    });
    this.producer.on('transportclose', () => {
      console.log('transportclosed');
    });
    return this.producer.id;
  }

  async transportConsume(rtpCapabilities: RtpCapabilities) {
    const canConsume = this.router.canConsume({
      producerId: this.producer?.id,
      rtpCapabilities,
    });

    if (canConsume) {
      this.consumer = await this.recvTransport.consume({
        producerId: this.producer.id,
        rtpCapabilities,
        paused: true,
      });
      const res = {
        id: this.consumer.id,
        producerId: this.producer.id,
        kind: this.consumer.kind,
        rtpParameters: this.consumer.rtpParameters,
      };
      return res;
    }
    return null;
  }

  async resumeConsumer() {
    try {
      await this.consumer.resume();
    } catch (err) {
      return false;
    }
    return true;
  }

  setUpObservers = (): void => {
    mediasoup.observer.on('newworker', (worker) => {
      console.log('new worker created [worker.pid:%d]', worker.pid);

      worker.observer.on('close', () => {
        console.log('worker closed [worker.pid:%d]', worker.pid);
      });

      worker.observer.on('newrouter', (router: Router) => {
        console.log(
          'new router created [worker.pid:%d, router.id:%s]',
          worker.pid,
          router.id,
        );

        router.observer.on('close', () => {
          console.log('router closed [router.id:%s]', router.id);
        });

        router.observer.on('newtransport', (transport: WebRtcTransport) => {
          console.log(
            'new transport created [worker.pid:%d, router.id:%s, transport.id:%s]',
            worker.pid,
            router.id,
            transport.id,
          );

          transport.observer.on('close', () => {
            console.log('transport closed [transport.id:%s]', transport.id);
          });

          transport.observer.on('icestatechange', (icestate) => {
            console.log('transport ICE state changed to', icestate);
          });

          transport.observer.on('newproducer', (producer: Producer) => {
            console.log(
              'new producer created [worker.pid:%d, router.id:%s, transport.id:%s, producer.id:%s]',
              worker.pid,
              router.id,
              transport.id,
              producer.id,
            );

            producer.observer.on('close', () => {
              console.log('producer closed [producer.id:%s]', producer.id);
            });
          });

          transport.observer.on('newconsumer', (consumer: Consumer) => {
            console.log(
              'new consumer created [worker.pid:%d, router.id:%s, transport.id:%s, consumer.id:%s]',
              worker.pid,
              router.id,
              transport.id,
              consumer.id,
            );

            consumer.observer.on('close', () => {
              console.log('consumer closed [consumer.id:%s]', consumer.id);
            });
          });
        });
      });
    });
  };
}
