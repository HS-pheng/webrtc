import { SignalingGateway } from './signaling.gateway';
import { forwardRef, Inject, Injectable } from '@nestjs/common';

@Injectable()
export class SignalingService {
  constructor(
    @Inject(forwardRef(() => SignalingGateway))
    private signalingGateway: SignalingGateway,
  ) {}

  async findSocketsByRoom(roomId: string): Promise<string[]> {
    const sockets = await this.signalingGateway.server
      .to(roomId)
      .fetchSockets();
    const socketIds = sockets.map((socket) => socket.id);
    return socketIds;
  }
}
