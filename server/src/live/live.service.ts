import { Injectable } from '@nestjs/common';
import { MsService } from 'src/mediasoup/ms.service';
import { Socket } from 'socket.io';
import { InterviewService } from 'src/interview/interview.service';
import { SocketService } from 'src/socket/socket.service';

@Injectable()
export class LiveService {
  constructor(
    private msService: MsService,
    private interviewService: InterviewService,
    private socketService: SocketService,
  ) {}

  msDisconnectionCleanup(client: Socket) {
    this.msService.closeUserTransports(client.id);
    client.broadcast.emit('producer-closed', client.id);
  }

  interviewDisconnectionCleanup(client) {
    this.interviewService.removeCandidate(client.id);
    this.socketService.broadcastToInterviewerGroup(
      'candidate-closed',
      client.id,
    );

    this.socketService.updateCandidateStatistics(
      this.interviewService.getWaitingList(),
    );
  }

  announceNewCandidate(client) {
    const updatedCandidateList = this.interviewService.getWaitingList();
    this.socketService.updateCandidateStatistics(updatedCandidateList);
    this.socketService.broadcastToInterviewerGroup('new-candidate', client.id);
  }

  async removePreviousCandidate() {
    const previousClient = (
      await this.socketService.findSocketById(
        this.interviewService.previousCandidate,
      )
    )?.[0];
    if (previousClient) {
      this.msService.closeUserTransports(previousClient.id);
      this.socketService.server.emit('producer-closed', previousClient.id);
      this.socketService.toCandidate(previousClient.id, 'interview-finished');
    }
  }

  announceMovingToNextCandidate(nextCandidate: string) {
    this.interviewService.previousCandidate = nextCandidate;
    this.interviewService.removeCandidate(nextCandidate);
    this.socketService.updateCandidateStatistics(
      this.interviewService.getWaitingList(),
    );

    this.socketService.toCandidate(nextCandidate, 'ready-for-interview');
    this.socketService.broadcastToInterviewerGroup('next-candidate');
  }
}
