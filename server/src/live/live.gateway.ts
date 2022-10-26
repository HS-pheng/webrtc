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
import { MsService } from 'src/plugin/ms.service';

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

  @SubscribeMessage('transport-setup')
  async transportSetup(
    @MessageBody() body: { setUpMode: string },
    @ConnectedSocket() client,
  ) {
    const { setUpMode } = body;
    const setUpParams = await this.msService.transportSetUp(
      setUpMode,
      client.id,
    );
    return setUpParams;
  }

  @SubscribeMessage('transport-connect')
  async transportConnect(@MessageBody() body): Promise<boolean> {
    const { dtlsParameters, transportId } = body;
    return this.msService.transportConnect(dtlsParameters, transportId);
  }

  @SubscribeMessage('transport-produce')
  async transportProduce(
    @MessageBody() body,
    @ConnectedSocket() client,
  ): Promise<string | null> {
    const { transportId, ...params } = body;
    return this.msService.transportProduce(params, transportId);
  }

  @SubscribeMessage('consume')
  async transportConsume(@MessageBody() body) {
    const { rtpCapabilities, transportId } = body;
    return this.msService.joinRoom(rtpCapabilities, transportId);
  }

  @SubscribeMessage('resume-consumer')
  async resumeConsumer(@MessageBody() body): Promise<boolean> {
    const { consumerId } = body;
    return this.msService.resumeConsumer(consumerId);
  }
}
