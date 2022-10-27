import { Device } from 'mediasoup-client';
import { Producer } from 'mediasoup-client/lib/Producer';
import { Transport } from 'mediasoup-client/lib/Transport';
import { usePeerStore } from '../stores/usePeerStore';
import { SocketPromise } from './socket-promise';
import { producerOptions } from '~~/constants/config';

export class MsManager {
  device: Device | null = null;
  socket: SocketPromise | null = null;

  sendTransport: Transport | null = null;
  recvTransport: Transport | null = null;

  producer: Producer | null = null;

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
    this.attachPeerListener();
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
    const peerProducers = await this.socket.request('join-room', {
      rtpCapabilities: deviceRTPCapabilities,
      transportId: this.recvTransport.id,
    });

    this.createPeerConsumers(peerProducers);
  }

  async createProducer(track: MediaStreamTrack) {
    const produceData = { track };
    if (track.kind === 'video') Object.assign(produceData, producerOptions);
    this.producer = await this.sendTransport.produce(produceData);
  }

  createConsumer(params) {
    return this.recvTransport.consume(params);
  }

  // --- peer logic ---
  attachPeerListener() {
    this.socket.on('new-producer', (producerId) => {
      this.handleNewPeerProducer(producerId);
    });

    this.socket.on('producer-closed', (producerId) => {
      this.handlePeerProducerClosed(producerId);
    });
  }

  createPeerConsumers(producers) {
    producers.forEach(async (e) => {
      const consumer = await this.createConsumer(e);

      await this.socket.request('resume-consumer', {
        consumerId: e.id,
      });

      this.peerStore.addPeer(consumer);
    });
  }

  async handleNewPeerProducer(producerId) {
    const params = await this.socket.request('get-new-producer', {
      producerId,
      rtpCapabilities: this.device.rtpCapabilities,
      transportId: this.recvTransport.id,
    });

    const consumer = await this.createConsumer(params);
    await this.socket.request('resume-consumer', {
      consumerId: consumer.id,
    });

    this.peerStore.addPeer(consumer);
  }

  handlePeerProducerClosed(producerId) {
    this.peerStore.removePeer(producerId);
  }
}
