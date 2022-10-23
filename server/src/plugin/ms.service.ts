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
import { setUpObservers } from 'src/utils/utils';
import { extractTransportData } from 'src/utils/utils';

@Injectable()
export class MsService {
  private worker: Worker = null;
  private router: Router = null;

  private listenIps = [
    {
      ip: '0.0.0.0',
      announcedIp: '192.168.1.127',
      // announcedIp: '172.30.224.1',
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
    setUpObservers();
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

    producer.on('transportclose', () => {
      // inform client that consumes the producer to close the consumer and make change to the UI
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

  closeUserTransports(clientId: string) {
    for (const [transportId, transport] of this.router.appData
      .transports as Map<string, WebRtcTransport>) {
      if (transport.appData.uid === clientId) {
        transport.close();
        (this.router.appData.transports as Map<string, WebRtcTransport>).delete(
          transportId,
        );
      }
    }
  }
}
