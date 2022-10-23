import { Device } from 'mediasoup-client';
import { Consumer } from 'mediasoup-client/lib/Consumer';
import { Producer } from 'mediasoup-client/lib/Producer';
import { Transport } from 'mediasoup-client/lib/Transport';
import { SocketPromise } from './socket-promise';
import { producerOptions } from '~~/constants/config';

export class MsManager {
  device: Device | null = null;
  socket: SocketPromise | null = null;

  sendTransport: Transport | null = null;
  recvTransport: Transport | null = null;

  producer: Producer | null = null;
  consumer: Consumer | null = null;

  peers = [];

  constructor() {
    try {
      this.device = new Device();
    } catch (err) {
      throw new Error(err);
    }
  }

  socketInit(socket: SocketPromise) {
    this.socket = socket;
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

  async createConsumer() {
    const deviceRTPCapabilities = this.device.rtpCapabilities;
    const params = await this.socket.request('consume', {
      rtpCapabilities: deviceRTPCapabilities,
      transportId: this.recvTransport.id,
    });

    this.consumer = await this.recvTransport.consume(params);

    await this.socket.request('resume-consumer', {
      consumerId: this.consumer.id,
    });
    return this.consumer.track;
  }
}
