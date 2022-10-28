import { workerSettings, mediaCodecs } from '../../config/mediasoup';
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
import { SignalingService } from 'src/signaling/signaling.service';
import { Socket } from 'socket.io';

@Injectable()
export class MsService {
  constructor(private signalingService: SignalingService) {}

  private worker: Worker = null;
  private router: Router = null;

  private listenIps = [
    {
      ip: '0.0.0.0',
      // announcedIp: '192.168.1.127',
      announcedIp: '172.25.45.172',
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

  async setupTransport(setUpMode, socketId) {
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

  async connectTransport(dtlsParameters: DtlsParameters, transportId: string) {
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

  async produce(params, transportId, client: Socket) {
    const transport = (
      this.router.appData.transports as Map<string, WebRtcTransport>
    ).get(transportId);

    if (!transport) return null;

    const producer = await this.createProducer(params, transport);
    client.broadcast.emit('new-producer', producer.id);

    return producer.id;
  }

  async createProducer(params, transport) {
    const producer: Producer = await transport.produce({
      kind: params.kind,
      rtpParameters: params.rtpParameters,
      appData: {
        uid: transport.appData.uid,
      },
    });

    producer.observer.on('close', () => {
      (this.router.appData.producers as Map<string, Producer>).delete(
        producer.id,
      );
      const producerClientId = producer.appData.uid;
      this.signalingService.server.emit('producer-closed', producerClientId);
    });

    (this.router.appData.producers as Map<string, Producer>).set(
      producer.id,
      producer,
    );

    return producer;
  }

  async joinRoom(
    rtpCapabilities: RtpCapabilities,
    transportId: string,
    clientId: string,
  ) {
    const transport = (
      this.router.appData.transports as Map<string, WebRtcTransport>
    ).get(transportId);

    const producers = [];
    (this.router.appData.producers as Map<string, Producer>).forEach(
      (producer) => {
        if (producer.appData.uid !== clientId) producers.push(producer);
      },
    );

    const consumers = [];
    producers.forEach(async (producer) => {
      const canConsume = this.router.canConsume({
        producerId: producer.id,
        rtpCapabilities,
      });

      if (!canConsume) return;

      consumers.push(
        new Promise(async (resolve) => {
          const consumer = await this.createConsumer(
            producer.id,
            transport,
            rtpCapabilities,
            clientId,
          );

          resolve({
            id: consumer.id,
            producerId: producer.id,
            kind: consumer.kind,
            rtpParameters: consumer.rtpParameters,
            appData: consumer.appData,
          });
        }),
      );
    });

    return await Promise.all(consumers);
  }

  async createConsumer(
    producerId: string,
    transport: WebRtcTransport,
    rtpCapabilities,
    clientId,
  ) {
    const producer = (
      this.router.appData.producers as Map<string, Producer>
    ).get(producerId);

    const consumer = await transport.consume({
      producerId,
      rtpCapabilities,
      paused: true,
      appData: {
        producerClientId: producer.appData.uid,
        uid: clientId,
      },
    });

    consumer.observer.on('close', () => {
      (this.router.appData.consumers as Map<string, Consumer>).delete(
        consumer.id,
      );
    });

    (this.router.appData.consumers as Map<string, Consumer>).set(
      consumer.id,
      consumer,
    );

    return consumer;
  }

  async getNewProducer(producerId, transportId, rtpCapabilities, clientId) {
    const transport = (
      this.router.appData.transports as Map<string, WebRtcTransport>
    ).get(transportId);

    if (!transport) return null;

    const consumer = await this.createConsumer(
      producerId,
      transport,
      rtpCapabilities,
      clientId,
    );

    return {
      id: consumer.id,
      producerId: producerId,
      kind: consumer.kind,
      rtpParameters: consumer.rtpParameters,
      appData: consumer.appData,
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
