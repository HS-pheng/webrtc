import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { candidateInfo, IPeerInfo } from 'src/constants/types';
import { WaitingListService } from 'src/waitingList/waitingList.service';
import { candidateGroup, interviewerGroup } from './socket.constant';

@Injectable()
export class SocketService {
  server: Server;

  constructor(private waitingListService: WaitingListService) {}

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

  async toInterviewRoomExceptSender(
    client: Socket,
    eventName: string,
    payload = {},
  ) {
    const currentCandidate = this.waitingListService.currentCandidate?.id ?? '';
    client.to(currentCandidate).to(interviewerGroup).emit(eventName, payload);
  }

  async updateCandidateStatistics(candidateList: candidateInfo[]) {
    const candidateListSize = candidateList.length;
    const candidateSockets = await this.server
      .in(candidateGroup)
      .fetchSockets();
    candidateSockets.forEach((socket) => {
      const listNumber =
        candidateList.findIndex((candidate) => candidate.id === socket.id) + 1;
      this.send(socket.id, 'candidate-statistic', {
        listNumber,
        candidateListSize,
      });
    });
  }

  async getPeersInfoExcept(client: Socket) {
    const currentCandidateSocketId =
      this.waitingListService.currentCandidate?.id ?? '';
    const socketsInInterviewRoom = await this.server
      .in(interviewerGroup)
      .in(currentCandidateSocketId)
      .fetchSockets();
    const peersInfo: { [socketId: string]: any } = {};
    socketsInInterviewRoom.forEach((socket) => {
      if (socket.id !== client.id)
        peersInfo[socket.id as keyof typeof peersInfo] =
          socket.data.handshakeData;
    });
    return peersInfo as { [peerId: string]: IPeerInfo };
  }
}
