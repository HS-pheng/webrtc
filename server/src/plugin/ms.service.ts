import { workerSettings, mediaCodecs } from './../../config/mediasoup';
import { Injectable } from '@nestjs/common';
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
import { extractTransportData } from 'src/utils/utils';

@Injectable()
export class MsService {
  private worker: Worker = null;
  private router: Router = null;

  private listenIps = [
    {
      ip: '0.0.0.0',
      announcedIp: '192.168.1.127',
    },
  ];

  async onModuleInit() {
    this.worker = await createWorker(workerSettings);
    this.router = await this.worker.createRouter({
      mediaCodecs,
      appData: {
        transports: new Map<string, WebRtcTransport>(),
        users: new Map(),
        producers: new Map(),
        consumers: new Map(),
      },
    });
    this.setUpObservers();
  }

  async transportSetUp(setUpMode, socketId) {
    const transports = {
      sendTransport:
        setUpMode === 'send' || setUpMode === 'both'
          ? await this.createTransport('send', socketId)
          : undefined,
      recvTransport:
        setUpMode === 'recv' || setUpMode === 'both'
          ? await this.createTransport('recv', socketId)
          : undefined,
    };

    return {
      rtpCapabilities: this.router.rtpCapabilities,
      recvTransport: extractTransportData(transports.recvTransport),
      sendTransport: extractTransportData(transports.sendTransport),
    };
  }

  async createTransport(type, uid) {
    const transport = await this.router.createWebRtcTransport({
      listenIps: this.listenIps,
      appData: {
        type,
        uid,
      },
    });

    (this.router.appData.transports as Map<string, WebRtcTransport>).set(
      transport.id,
      transport,
    );

    return transport;
  }

  async transportConnect(dtlsParameters: DtlsParameters, transportId: string) {
    const transport = (
      this.router.appData.transports as Map<string, WebRtcTransport>
    ).get(transportId);

    if (!transport) return false;

    try {
      await transport.connect({ dtlsParameters });
    } catch (err) {
      return false;
    }
    return true;
  }

  async transportProduce(params, transportId) {
    const transport = (
      this.router.appData.transports as Map<string, WebRtcTransport>
    ).get(transportId);

    if (!transport) return null;

    const producer = await transport.produce({
      kind: params.kind,
      rtpParameters: params.rtpParameters,
      appData: {
        uid: transport.appData.uid,
      },
    });

    (this.router.appData.producers as Map<string, Producer>).set(
      producer.id,
      producer,
    );

    return producer.id;
  }

  async joinRoom(rtpCapabilities: RtpCapabilities, transportId: string) {
    const transport = (
      this.router.appData.transports as Map<string, WebRtcTransport>
    ).get(transportId);

    // to avoid using the previously unclosed producers -- for temporary dev only, because multiparty call is not supported yet
    // it suppose to response with an array of consumers for each producers in the router
    const producers = [];
    (this.router.appData.producers as Map<string, Producer>).forEach((val) =>
      producers.push(val),
    );
    const producer = producers[producers.length - 1];

    const canConsume = this.router.canConsume({
      producerId: producer.id,
      rtpCapabilities,
    });

    if (!canConsume) return null;

    const consumer = await transport.consume({
      producerId: producer.id,
      rtpCapabilities,
      paused: true,
    });

    (this.router.appData.consumers as Map<string, Consumer>).set(
      consumer.id,
      consumer,
    );

    return {
      id: consumer.id,
      producerId: producer.id,
      kind: consumer.kind,
      rtpParameters: consumer.rtpParameters,
    };
  }

  async resumeConsumer(consumerId: string) {
    const consumer = (
      this.router.appData.consumers as Map<string, Consumer>
    ).get(consumerId);

    try {
      await consumer.resume();
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
