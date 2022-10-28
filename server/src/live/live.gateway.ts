import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  MessageBody,
} from '@nestjs/websockets';
import { SignalingService } from '../signaling/signaling.service';
import { Socket, Server } from 'socket.io';
import { MsService } from 'src/mediasoup/ms.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class LiveGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  constructor(
    private readonly signalingService: SignalingService,
    private readonly msService: MsService,
  ) {}

  afterInit(server: Server) {
    this.signalingService.injectServer(server);
  }

  async handleConnection(@ConnectedSocket() client: Socket): Promise<void> {
    console.log('This client just connected :', client.id);
  }

  async handleDisconnect(@ConnectedSocket() client: Socket): Promise<void> {
    console.log('This client just disconnected :', client.id);
    this.msService.closeUserTransports(client.id);
  }

  @SubscribeMessage('setup-transport')
  async setupTransport(
    @MessageBody() body: { setUpMode: string },
    @ConnectedSocket() client,
  ) {
    const { setUpMode } = body;
    const setUpParams = await this.msService.setupTransport(
      setUpMode,
      client.id,
    );
    return setUpParams;
  }

  @SubscribeMessage('connect-transport')
  async connectTransport(@MessageBody() body): Promise<boolean> {
    const { dtlsParameters, transportId } = body;
    return this.msService.connectTransport(dtlsParameters, transportId);
  }

  @SubscribeMessage('produce')
  async produce(
    @MessageBody() body,
    @ConnectedSocket() client: Socket,
  ): Promise<string | null> {
    const { transportId, ...params } = body;
    return this.msService.produce(params, transportId, client);
  }

  @SubscribeMessage('join-room')
  async transportConsume(@MessageBody() body, @ConnectedSocket() client) {
    const { rtpCapabilities, transportId } = body;
    return this.msService.joinRoom(rtpCapabilities, transportId, client.id);
  }

  @SubscribeMessage('get-new-producer')
  async getNewProducer(@MessageBody() body, @ConnectedSocket() client) {
    const { producerId, rtpCapabilities, transportId } = body;
    return this.msService.getNewProducer(
      producerId,
      transportId,
      rtpCapabilities,
      client.id,
    );
  }

  @SubscribeMessage('resume-consumer')
  async resumeConsumer(@MessageBody() body): Promise<boolean> {
    const { consumerId } = body;
    return this.msService.resumeConsumer(consumerId);
  }
}
