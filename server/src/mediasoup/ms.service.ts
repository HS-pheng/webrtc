import { workerSettings, mediaCodecs, listenIps } from '../../config/mediasoup';
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
import { Socket } from 'socket.io';
import { Transport } from 'mediasoup/node/lib/Transport';

@Injectable()
export class MsService {
  private worker: Worker = null;
  private router: Router = null;

  async onModuleInit() {
    setUpObservers();
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
  }

  async setupTransport(setUpMode: 'send' | 'recv' | 'both', socket: Socket) {
    const transports = {
      sendTransport:
        setUpMode === 'send' || setUpMode === 'both'
          ? await this.createTransport('send', socket.id)
          : undefined,
      recvTransport:
        setUpMode === 'recv' || setUpMode === 'both'
          ? await this.createTransport('recv', socket.id)
          : undefined,
    };

    return {
      rtpCapabilities: this.router.rtpCapabilities,
      recvTransport: extractTransportData(transports.recvTransport),
      sendTransport: extractTransportData(transports.sendTransport),
    };
  }

  async createTransport(type: 'send' | 'recv', uid: string) {
    const transport = await this.router.createWebRtcTransport({
      listenIps,
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

  async produce(params: any, transportId: string) {
    const transport = (
      this.router.appData.transports as Map<string, WebRtcTransport>
    ).get(transportId);

    if (!transport) return null;

    const producer = await this.createProducer(params, transport);
    return producer.id;
  }

  async createProducer(params: any, transport: Transport) {
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
    client: Socket,
  ) {
    const transport = (
      this.router.appData.transports as Map<string, WebRtcTransport>
    ).get(transportId);

    const producers: Producer[] = [];
    (this.router.appData.producers as Map<string, Producer>).forEach(
      (producer) => {
        if (producer.appData.uid !== client.id) producers.push(producer);
      },
    );

    const consumers: Promise<any>[] = [];
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
            client,
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
    rtpCapabilities: any,
    client: Socket,
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
        uid: client.id,
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

  async getNewProducer(
    producerId: string,
    transportId: string,
    rtpCapabilities: any,
    client: Socket,
  ) {
    const transport = (
      this.router.appData.transports as Map<string, WebRtcTransport>
    ).get(transportId);

    if (!transport) return null;

    const consumer = await this.createConsumer(
      producerId,
      transport,
      rtpCapabilities,
      client,
    );

    return {
      id: consumer.id,
      producerId: producerId,
      kind: consumer.kind,
      rtpParameters: consumer.rtpParameters,
      appData: consumer.appData,
    };
  }

  async toggleProducer(
    producerId: string,
    state: 'on' | 'off',
    client: Socket,
  ) {
    const producer = (
      this.router.appData.producers as Map<string, Producer>
    ).get(producerId);

    if (producer?.appData.uid !== client.id) return;

    if (state === 'on') {
      console.log('trying to resume producer: ', producer.id);
      await producer.resume();
      console.log('resumed producer: ', producer.id);
    } else {
      console.log('trying to pause producer: ', producer.id);
      await producer.pause();
      console.log('paused producer: ', producer.id);
    }
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
