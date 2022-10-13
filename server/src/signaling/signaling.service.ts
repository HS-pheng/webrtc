import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class SignalingService {
  server: Server;

  injectServer(server: Server) {
    this.server = server;
  }

  async findSocketsByRoom(roomId: string): Promise<string[]> {
    const sockets = await this.server.in(roomId).fetchSockets();
    const socketIds = sockets.map((socket) => socket.id);
    return socketIds;
  }

  send<T>(roomId: string, eventName: string, payload: T): void {
    this.server.in(roomId).emit(eventName, payload);
  }
}
