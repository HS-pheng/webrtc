import { Injectable } from '@nestjs/common';
import { stringify } from 'querystring';
import { Server, Socket } from 'socket.io';
import { IPeerInfo } from 'src/constants/types';
import { WaitingListService } from 'src/waitingList/waitingList.service';
import { candidateGroup, interviewerGroup } from './socket.constant';

@Injectable() // change name to socketService
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
    const currentCandidate = this.waitingListService.currentCandidate;
    client.to(currentCandidate).to(interviewerGroup).emit(eventName, payload);
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

  async getPeersInfoExcept(client: Socket) {
    const currentCandidateSocketId = this.waitingListService.currentCandidate;
    const socketsInInterviewRoom = await this.server
      .in(interviewerGroup)
      .in(currentCandidateSocketId)
      .fetchSockets();
    const peersInfo = {};
    socketsInInterviewRoom.forEach((socket) => {
      if (socket.id !== client.id)
        peersInfo[socket.id] = socket.data.handshakeData;
    });
    return peersInfo as { [peerId: string]: IPeerInfo };
  }
}
