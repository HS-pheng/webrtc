import { Device } from 'mediasoup-client';
import { Producer } from 'mediasoup-client/lib/Producer';
import { Transport } from 'mediasoup-client/lib/Transport';
import { SocketPromise } from './socket-promise';
import { producerOptions } from '~~/constants/config';
import { ICreateConsumer } from '~~/constants/types';

export class MsManager {
  device: Device | null = null;
  socket: SocketPromise | null = null;

  sendTransport: Transport | null = null;
  recvTransport: Transport | null = null;

  videoProducer: Producer | null = null;
  audioProducer: Producer | null = null;

  constructor() {
    try {
      this.device = new Device();
    } catch (err) {
      throw new Error(err as any);
    }
  }

  socketInit(socket: SocketPromise) {
    this.socket = socket;
  }

  async init(setUpMode: string) {
    const setUpParams = await this.socket?.request('setup-transport', {
      setUpMode,
    });
    await this.setUpTransport(setUpParams);
  }

  async setUpTransport(setUpParams: {
    sendTransport: any;
    recvTransport: any;
    rtpCapabilities: any;
  }) {
    if (!this.device?.loaded) {
      await this.device?.load({
        routerRtpCapabilities: setUpParams.rtpCapabilities,
      });
    }
    if (setUpParams.sendTransport) {
      this.sendTransport = this.device!.createSendTransport(
        setUpParams.sendTransport,
      );
      this.attachTransportEventListener('send');
    }
    if (setUpParams.recvTransport) {
      this.recvTransport = this.device!.createRecvTransport(
        setUpParams.recvTransport,
      );
      this.attachTransportEventListener('recv');
    }
  }

  attachTransportEventListener(type: 'send' | 'recv') {
    let targetTransport = this.recvTransport;
    if (type === 'send') {
      targetTransport = this.sendTransport;
      targetTransport!.on(
        'produce',
        async ({ kind, rtpParameters, appData }, callback, errback) => {
          try {
            const id = await this.socket!.request('produce', {
              kind,
              rtpParameters,
              transportId: targetTransport!.id,
              appData,
            });

            if (!id) throw new Error('cannot create producer');
            // eslint-disable-next-line n/no-callback-literal
            callback({ id });
          } catch (e) {
            errback(e as any);
          }
        },
      );
    }
    targetTransport!.on(
      'connect',
      async ({ dtlsParameters }, callback, errback) => {
        try {
          const success = await this.socket!.request('connect-transport', {
            dtlsParameters,
            transportId: targetTransport!.id,
          });
          if (!success) throw new Error('connection failed');
          callback();
        } catch (e) {
          errback(e as any);
        }
      },
    );
  }

  async getPeersMSConsumers() {
    const peerProducers: ICreateConsumer[] = await this.socket!.request(
      'join-interview-room',
      {
        rtpCapabilities: this.device!.rtpCapabilities,
        transportId: this.recvTransport!.id,
      },
    );

    return this.createPeerConsumers(peerProducers);
  }

  async createProducer(track: MediaStreamTrack) {
    const produceData = { track };

    if (track.kind === 'audio') {
      this.audioProducer = await this.sendTransport!.produce(produceData);
      return;
    }

    Object.assign(produceData, producerOptions);
    this.videoProducer = await this.sendTransport!.produce(produceData);
    console.log('producer id: ', this.videoProducer.id);
  }

  createConsumer(params: ICreateConsumer) {
    return this.recvTransport!.consume(params);
  }

  async toggleMediaProducer(
    mediaType: 'audio' | 'video',
    track: MediaStreamTrack | null,
  ) {
    const producer =
      mediaType === 'video' ? this.videoProducer : this.audioProducer;

    if (producer!.paused) {
      await producer!.replaceTrack({ track });
      producer!.resume();
    } else {
      producer!.pause();
    }

    return producer!.id;
  }

  // --- peer logic ---

  createPeerConsumers(peerProducers: ICreateConsumer[]) {
    const consumers = peerProducers.map(async (producer) => {
      const consumer = await this.createConsumer(producer);

      await this.socket!.request('resume-consumer', {
        consumerId: producer.id,
      });

      return consumer;
    });

    return Promise.all(consumers);
  }

  async handleNewPeerProducer(producerId: string) {
    const params: ICreateConsumer = await this.socket!.request(
      'get-new-producer',
      {
        producerId,
        rtpCapabilities: this.device!.rtpCapabilities,
        transportId: this.recvTransport!.id,
      },
    );

    const consumer = await this.createConsumer(params);

    await this.socket!.request('resume-consumer', {
      consumerId: consumer.id,
    });

    return consumer;
  }

  closeTransports() {
    this.sendTransport?.close();
    this.recvTransport?.close();
  }
}
