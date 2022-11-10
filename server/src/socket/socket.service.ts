import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { candidateGroup } from './socket.constant';

@Injectable() // change name to socketService
export class SocketService {
  server: Server;

  injectServer(server: Server) {
    this.server = server;
  }

  send(roomId: string, eventName: string, payload = {}): void {
    this.server.in(roomId).emit(eventName, payload);
  }

  async findSocketById(socketId: string) {
    return (await this.server.fetchSockets()).filter(
      (socket) => socket.id === socketId,
    );
  }

  async updateCandidateStatistics(candidateList) {
    const candidateListSize = candidateList.length;
    const candidateSockets = await this.server
      .in(candidateGroup)
      .fetchSockets();
    candidateSockets.forEach((socket) => {
      const listNumber = candidateList.indexOf(socket.id) + 1;
      console.log(
        `list number ${listNumber}...list size: ${candidateListSize}`,
      );
      this.send(socket.id, 'candidate-statistic', {
        listNumber,
        candidateListSize,
      });
    });
  }
}
