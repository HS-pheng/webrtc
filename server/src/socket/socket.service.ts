import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';
import { interviewerGroup, candidateGroup } from './socket.constant';

@Injectable() // change name to socketService
export class SocketService {
  server: Server;

  injectServer(server: Server) {
    this.server = server;
  }

  send<T>(roomId: string, eventName: string, payload: T): void {
    this.server.in(roomId).emit(eventName, payload);
  }

  async findSocketById(socketId: string) {
    return (await this.server.fetchSockets()).filter(
      (socket) => socket.id === socketId,
    );
  }

  broadcastToInterviewerGroup(eventName: string, payload = {}) {
    this.server.in(interviewerGroup).emit(eventName, payload);
  }

  toCandidate(clientId, eventName, payload = {}) {
    this.server.to(clientId).emit(eventName, payload);
  }

  async updateCandidateStatistics(candidateList) {
    const candidateListSize = candidateList.length;
    const candidateSockets = await this.server
      .in(candidateGroup)
      .fetchSockets();
    candidateSockets.forEach((socket) => {
      const listNumber = candidateList.indexOf(socket.id) + 1;
      this.toCandidate(socket.id, 'candidate-statistic', {
        listNumber,
        candidateListSize,
      });
    });
  }

  // emitProducerClosed, emitNewProducer, broadcastToInterviewRoom, broadcastToWaitingRoom, broadcastToCandidateGroup
  // broadcastToInterviewerGroup
}
