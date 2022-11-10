import { Device } from 'mediasoup-client';
import { Producer } from 'mediasoup-client/lib/Producer';
import { Transport } from 'mediasoup-client/lib/Transport';
import { usePeerStore } from '../stores/usePeerStore';
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

  peerStore = null;

  constructor() {
    try {
      this.device = new Device();
      this.peerStore = usePeerStore();
    } catch (err) {
      throw new Error(err);
    }
  }

  socketInit(socket: SocketPromise) {
    this.socket = socket;
  }

  async init(setUpMode: string) {
    const setUpParams = await this.socket.request('setup-transport', {
      setUpMode,
    });
    await this.setUpTransport(setUpParams);
  }

  async setUpTransport(setUpParams) {
    if (!this.device.loaded) {
      await this.device.load({
        routerRtpCapabilities: setUpParams.rtpCapabilities,
      });
    }
    if (setUpParams.sendTransport) {
      this.sendTransport = this.device.createSendTransport(
        setUpParams.sendTransport,
      );
      this.attachTransportEventListener('send');
    }
    if (setUpParams.recvTransport) {
      this.recvTransport = this.device.createRecvTransport(
        setUpParams.recvTransport,
      );
      this.attachTransportEventListener('recv');
    }
    this.attachPeerListener();
  }

  attachTransportEventListener(type: 'send' | 'recv') {
    let targetTransport = this.recvTransport;
    if (type === 'send') {
      targetTransport = this.sendTransport;
      targetTransport.on(
        'produce',
        async ({ kind, rtpParameters, appData }, callback, errback) => {
          try {
            const id = await this.socket.request('produce', {
              kind,
              rtpParameters,
              transportId: targetTransport.id,
              appData,
            });

            if (!id) throw new Error('cannot create producer');
            // eslint-disable-next-line n/no-callback-literal
            callback({ id });
          } catch (e) {
            errback(e);
          }
        },
      );
    }
    targetTransport.on(
      'connect',
      async ({ dtlsParameters }, callback, errback) => {
        try {
          const success = await this.socket.request('connect-transport', {
            dtlsParameters,
            transportId: targetTransport.id,
          });
          if (!success) throw new Error('connection failed');
          callback();
        } catch (e) {
          errback(e);
        }
      },
    );
  }

  async joinRoom() {
    const deviceRTPCapabilities = this.device.rtpCapabilities;
    const peerProducers: ICreateConsumer[] = await this.socket.request(
      'join-interview-room',
      {
        rtpCapabilities: deviceRTPCapabilities,
        transportId: this.recvTransport.id,
      },
    );

    this.createPeerConsumers(peerProducers);
  }

  async createProducer(track: MediaStreamTrack) {
    const produceData = { track };

    if (track.kind === 'audio') {
      this.audioProducer = await this.sendTransport.produce(produceData);
      return;
    }

    Object.assign(produceData, producerOptions);
    this.videoProducer = await this.sendTransport.produce(produceData);
  }

  createConsumer(params: ICreateConsumer) {
    return this.recvTransport.consume(params);
  }

  // --- peer logic ---
  attachPeerListener() {
    this.socket.on('new-producer', (producerId) => {
      console.log('received new producer');
      console.log('device state', this.device.loaded);
      this.handleNewPeerProducer(producerId);
    });

    this.socket.on('producer-closed', (producerClientId) => {
      console.log('device state', this.device.loaded);
      this.handlePeerProducerClosed(producerClientId);
    });
  }

  createPeerConsumers(peerProducers: ICreateConsumer[]) {
    peerProducers.forEach(async (producer) => {
      const consumer = await this.createConsumer(producer);

      const producerClientId = consumer.appData.producerClientId;

      await this.socket.request('resume-consumer', {
        consumerId: producer.id,
      });

      console.log('peer here');
      this.peerStore.addPeer(consumer, producerClientId);
    });
  }

  async handleNewPeerProducer(producerId) {
    const params: ICreateConsumer = await this.socket.request(
      'get-new-producer',
      {
        producerId,
        rtpCapabilities: this.device.rtpCapabilities,
        transportId: this.recvTransport.id,
      },
    );

    const consumer = await this.createConsumer(params);
    const producerClientId = consumer.appData.producerClientId;

    await this.socket.request('resume-consumer', {
      consumerId: consumer.id,
    });

    this.peerStore.addPeer(consumer, producerClientId);
  }

  handlePeerProducerClosed(producerClientId) {
    this.peerStore.removePeer(producerClientId);
  }

  closeTransports() {
    this.sendTransport?.close();
    this.recvTransport?.close();
  }
}
