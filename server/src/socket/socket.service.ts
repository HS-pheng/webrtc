import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable() // change name to socketService
export class SocketService {
  server: Server;
  interviewRoom = 'interview-room';
  interviewerGroup = 'interview-group';
  candidateGroup = 'candidate-group';

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

  async findSocketById(socketId: string) {
    return (await this.server.fetchSockets()).filter(
      (socket) => socket.id === socketId,
    );
  }

  joinInterviewerGroup(client) {
    client.join(this.interviewerGroup);
  }

  joinCandidateGroup(client) {
    client.join(this.candidateGroup);
  }

  joinInterviewRoom(client) {
    client.join(this.interviewRoom);
  }

  broadcastToInterviewerGroup(eventName: string, payload = {}) {
    this.server.in(this.interviewerGroup).emit(eventName, payload);
  }

  toCandidate(clientId, eventName, payload = {}) {
    this.server.to(clientId).emit(eventName, payload);
  }

  async updateCandidateStatistics(candidateList) {
    const candidateListSize = candidateList.length;
    const candidateSockets = await this.server
      .in(this.candidateGroup)
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
