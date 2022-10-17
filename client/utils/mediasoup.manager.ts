import { Device } from 'mediasoup-client';
import { Consumer } from 'mediasoup-client/lib/Consumer';
import { Producer } from 'mediasoup-client/lib/Producer';
import { Transport } from 'mediasoup-client/lib/Transport';
import { useWebsocket } from './../stores/useWebsocket';
import { SocketPromise } from './socket-promise';

export class MsManager {
  device: Device | null = null;
  socketPromise: SocketPromise | null = null;
  sendTransport: Transport | null = null;
  recvTransport: Transport | null = null;
  producer: Producer | null = null;
  consumer: Consumer | null = null;

  constructor() {
    const { socketPromise } = useWebsocket();
    this.socketPromise = socketPromise as SocketPromise;
    try {
      this.device = new Device();
    } catch (err) {
      console.log(err);
      console.log(this.device);
    }
  }

  test() {
    const res = this.socketPromise.request('test', {});
    return res;
  }

  // .init(attachEventListener (listen for setup params), and emit mediasoupSetup with the type of setup (consume, produce or both))
  init(setUpMode: string) {
    this.attachEventListener();
    this.socketPromise.request('mediasoup-setup', { setUpMode });
  }

  attachEventListener() {
    this.socketPromise.on('transport-setup', (payload) => {
      console.log(payload);
      this.setUpTransport(payload);
    });
  }

  setUpTransport(setUpParams) {
    this.device.load({ routerRtpCapabilities: setUpParams.rtpCapabilities });
    if (setUpParams.sendTransport) {
      this.sendTransport = this.device.createSendTransport(
        setUpParams.sendTransport,
      );
    }
    if (setUpParams.recvTransport) {
      this.recvTransport = this.device.createRecvTransport(
        setUpParams.recvTransport,
      );
    }
    // setUpTransportDto to
    // load device
    // create send transport if there is send transport params
    // create recv transport if there is recv transport params
  }

  createSendTransport() {
    // create sendTrasnport and attach 'connect' and 'produce' event to it
    // connect event when fired should send dtlsParameters
    // produce event when fired should send kind and rtpParams
  }

  createRecvTransport() {
    // create recvTransport and attach 'connect' to it
    // connect event when fired should send dtlsParameters
  }

  createProducer() {
    // this method should receive the track from the localStream
    // call sendTransport.produce then the producer will be created
  }

  createConsumer() {
    // emit ('consume') event and send the deviceRTPCapability
    // server will determine if the device can consume the media
    // if yes, take the payload from the server, and use it to call recvTransport.consume
    // then the consumer will be created
  }
}
