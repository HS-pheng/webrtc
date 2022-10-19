import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  MessageBody,
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

  afterInit(server: Server) {
    this.signalingService.injectServer(server);
  }

  async handleConnection(@ConnectedSocket() client: Socket): Promise<void> {
    console.log('This client just connected :', client.id);
  }

  async handleDisconnect(@ConnectedSocket() client: Socket): Promise<void> {
    console.log('This client just disconnected : ', client.id);
  }

  @SubscribeMessage('transport-setup')
  async transportSetup(@MessageBody() body: { setUpMode: string }) {
    const { setUpMode } = body;
    const setUpParams = await this.msService.transportSetUp(setUpMode);
    return setUpParams;
  }

  @SubscribeMessage('transport-connect')
  async transportConnect(@MessageBody() body): Promise<boolean> {
    const { dtlsParameters } = body;
    return this.msService.transportConnect(dtlsParameters);
  }

  @SubscribeMessage('transport-produce')
  async transportProduce(@MessageBody() body): Promise<string> {
    return this.msService.transportProduce(body);
  }

  @SubscribeMessage('transport-recv-connect')
  async transportRecvConnect(@MessageBody() body): Promise<boolean> {
    const { dtlsParameters } = body;
    return this.msService.transportRecvConnect(dtlsParameters);
  }

  @SubscribeMessage('consume')
  async transportConsume(@MessageBody() body) {
    const { rtpCapabilities } = body;
    return this.msService.transportConsume(rtpCapabilities);
  }

  @SubscribeMessage('resume')
  async resumeConsumer(): Promise<boolean> {
    return this.msService.resumeConsumer();
  }
}
