import { Device } from 'mediasoup-client';
import { Consumer } from 'mediasoup-client/lib/Consumer';
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
  consumer: Consumer | null = null;

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
    this.attachSocketEventListener();
  }

  attachSocketEventListener() {
    this.socket.on('producer-closed', (producerId) => {
      console.log('producer closed, id: ', producerId);
      this.peerStore.removePeer(producerId);
      console.log('consumer closed');
    });

    this.socket.on('new-producer', async (producerId) => {
      console.log('new producer id: ', producerId);
      const params = await this.socket.request('get-new-producer', {
        producerId,
        rtpCapabilities: this.device.rtpCapabilities,
        transportId: this.recvTransport.id,
      });

      const consumer = await this.recvTransport.consume(params);
      console.log('new consumer: ', consumer.id);

      await this.socket.request('resume-consumer', {
        consumerId: consumer.id,
      });

      this.peerStore.addPeer(consumer);
    });
  }

  async init(setUpMode: string) {
    const setUpParams = await this.socket.request('transport-setup', {
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
            const id = await this.socket.request('transport-produce', {
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
          const success = await this.socket.request('transport-connect', {
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

  async createProducer(track: MediaStreamTrack) {
    this.producer = await this.sendTransport.produce({
      track,
      ...producerOptions,
    });
  }

  async joinRoom() {
    const deviceRTPCapabilities = this.device.rtpCapabilities;
    const params = await this.socket.request('join-room', {
      rtpCapabilities: deviceRTPCapabilities,
      transportId: this.recvTransport.id,
    });

    console.log({ params });

    params.forEach(async (e) => {
      const consumer = await this.recvTransport.consume(e);
      await this.socket.request('resume-consumer', {
        consumerId: e.id,
      });
      // this.peerStore.peers.push(consumer);
      this.peerStore.addPeer(consumer);
      console.log('consumer id for resume: ', e.id);
    });
  }
}
