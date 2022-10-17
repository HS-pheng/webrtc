import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { SignalingService } from './signaling.service';
import { Socket, Server } from 'socket.io';
import { MsService } from 'src/plugin/ms.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SignalingGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  constructor(
    private readonly signalingService: SignalingService,
    private readonly msService: MsService,
  ) {}

  @WebSocketServer() server: Server;

  afterInit(server: Server) {
    this.signalingService.injectServer(server);
  }

  async handleConnection(@ConnectedSocket() client: Socket): Promise<void> {
    console.log('This client just connected :', client.id);
  }

  async handleDisconnect(@ConnectedSocket() client: Socket): Promise<void> {
    console.log('This client just disconnected :', client.id);
    const roomId = 'room';
    const socketIds = await this.signalingService.findSocketsByRoom(roomId);
    this.signalingService.send<string[]>(roomId, 'left', socketIds);
  }

  @SubscribeMessage('test')
  test() {
    return {
      status: 'ok',
    };
  }

  @SubscribeMessage('getRouterRTPCapabilities')
  getRouterRTPCapability() {
    return {
      rtpCapabilities: this.msService.getRouterRTPCapabilities(),
    };
  }

  // subscribeMessage('mediasoup-setup')
  // should receive the socketId, the type of setUp, (a send or receive for the transport)
  // should send back all the setup requirement like routerRTPCaps, and transportParameters (based on send or receive)

  @SubscribeMessage('mediasoup-setup')
  async mediasoupSetup(
    @MessageBody() body: { setUpMode: string },
  ): Promise<void> {
    const { setUpMode } = body;
    const setUpParams = await this.msService.transportSetUp(setUpMode);
    console.log('setup', setUpParams);
    this.server.emit('transport-setup', setUpParams);
  }

  // (transport-connect) message
  // should receive the dtlsparameter and use that to call produceTransport.connect()
  // (transport-produce) message
  // should receive the kind and rtpParameter (track included) and call the produceTransport.produce()
  // should return the producer.id

  // (consume) message
  // should recieve the deviceRTPCapability and run the canConsume function
  // if canConsume, then use the consumerTransport to call .consume
  // then return the consumerId, producerId, consumer.kind, consumer.rtpParameters
  // (transport-recv-connect) message
  // should receive the dtlsparameter and us that to call the consumerTransport.connect()
}
