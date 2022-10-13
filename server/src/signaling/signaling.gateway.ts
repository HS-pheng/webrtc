import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { SignalingService } from './signaling.service';
import { Socket, Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SignalingGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  constructor(private readonly signalingService: SignalingService) {}

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

  @SubscribeMessage('join')
  async joinRoom(
    @ConnectedSocket() client: Socket,
  ): Promise<{ status: string }> {
    const roomId = 'room';
    client.join(roomId);
    const socketIds = await this.signalingService.findSocketsByRoom(roomId);
    this.signalingService.send<string[]>(roomId, 'joined', socketIds);
    return {
      status: 'OK',
    };
  }
}
