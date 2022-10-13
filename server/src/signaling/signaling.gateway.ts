import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { SignalingService } from './signaling.service';
import { Socket, Server } from 'socket.io';
import { forwardRef, Inject } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SignalingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    @Inject(forwardRef(() => SignalingService))
    private readonly signalingService: SignalingService,
  ) {}

  @WebSocketServer() server: Server;

  async handleConnection(@ConnectedSocket() client: Socket): Promise<void> {
    console.log('This client just connected :', client.id);
  }

  async handleDisconnect(@ConnectedSocket() client: Socket): Promise<void> {
    console.log('This client just disconnected :', client.id);
    const socketIds = await this.signalingService.findSocketsByRoom('room');
    this.server.to('room').emit('left', socketIds);
  }

  @SubscribeMessage('join')
  async joinRoom(
    @ConnectedSocket() client: Socket,
  ): Promise<{ status: string }> {
    client.join('room');
    const socketIds = await this.signalingService.findSocketsByRoom('room');
    this.server.to('room').emit('joined', socketIds);
    return {
      status: 'OK',
    };
  }
}
