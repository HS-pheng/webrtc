import { Device } from 'mediasoup-client';
import { Consumer } from 'mediasoup-client/lib/Consumer';
import { Producer } from 'mediasoup-client/lib/Producer';
import { Transport } from 'mediasoup-client/lib/Transport';
import { useWebsocket } from './../stores/useWebsocket';
import { SocketPromise } from './socket-promise';
import { producerOptions } from '~~/constants/config';

export class MsManager {
  device: Device | null = null;
  socketPromise: SocketPromise | null = null;

  sendTransport: Transport | null = null;
  recvTransport: Transport | null = null;

  producer: Producer | null = null;
  consumer: Consumer | null = null;

  constructor() {
    try {
      this.device = new Device();
    } catch (err) {
      throw new Error(err);
    }
  }

  socketInit() {
    const { socketPromise } = useWebsocket();
    this.socketPromise = socketPromise as SocketPromise;
  }

  async init(setUpMode: string) {
    const setUpParams = await this.socketPromise.request('transport-setup', {
      setUpMode,
    });
    await this.setUpTransport(setUpParams);
  }

  async setUpTransport(setUpParams) {
    await this.device.load({
      routerRtpCapabilities: setUpParams.rtpCapabilities,
    });
    if (setUpParams.sendTransport) {
      this.sendTransport = this.device.createSendTransport(
        setUpParams.sendTransport,
      );
      this.attachProduceEventListener();
    }
    if (setUpParams.recvTransport) {
      this.recvTransport = this.device.createRecvTransport(
        setUpParams.recvTransport,
      );
      this.attachConsumeEventListener();
    }
  }

  attachProduceEventListener() {
    this.sendTransport.on('connect', async ({ dtlsParameters }, callback) => {
      const success = await this.socketPromise.request('transport-connect', {
        dtlsParameters,
        transportId: this.sendTransport.id,
      });
      if (success) {
        callback();
      }
    });
    this.sendTransport.on(
      'produce',
      async ({ kind, rtpParameters, appData }, callback) => {
        const id = await this.socketPromise.request('transport-produce', {
          kind,
          rtpParameters,
          transportId: this.sendTransport.id,
          appData,
        });
        // eslint-disable-next-line n/no-callback-literal
        callback({ id });
      },
    );
  }

  attachConsumeEventListener() {
    this.recvTransport.on('connect', async ({ dtlsParameters }, callback) => {
      const success = await this.socketPromise.request('transport-connect', {
        dtlsParameters,
        transportId: this.recvTransport.id,
      });
      if (success) {
        callback();
      }
    });
  }

  async createProducer(track: MediaStreamTrack) {
    this.producer = await this.sendTransport.produce({
      track,
      ...producerOptions,
    });
  }

  async createConsumer() {
    const deviceRTPCapabilities = this.device.rtpCapabilities;
    const params = await this.socketPromise.request('consume', {
      rtpCapabilities: deviceRTPCapabilities,
      transportId: this.recvTransport.id,
    });

    this.consumer = await this.recvTransport.consume({
      id: params.id,
      producerId: params.producerId,
      kind: params.kind,
      rtpParameters: params.rtpParameters,
    });

    await this.socketPromise.request('resume-consumer', {
      consumerId: this.consumer.id,
    });
    return this.consumer.track;
  }
}
