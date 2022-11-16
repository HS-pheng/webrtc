import { Injectable } from '@nestjs/common';
import { MsService } from 'src/mediasoup/ms.service';
import { Socket } from 'socket.io';
import { WaitingListService } from 'src/waitingList/waitingList.service';
import { SocketService } from 'src/socket/socket.service';
import { interviewerGroup } from 'src/socket/socket.constant';
import { CommunicationEvents } from 'src/constants/events';

@Injectable()
export class LiveService {
  constructor(
    private msService: MsService,
    private watingListService: WaitingListService,
    private socketService: SocketService,
  ) {}

  msDisconnectionCleanup(client: Socket) {
    this.msService.closeUserTransports(client.id);
    this.socketService.toInterviewRoomExceptSender(
      client,
      CommunicationEvents.PRODUCER_CLOSED,
      client.id,
    );
  }

  interviewDisconnectionCleanup(client: Socket) {
    this.watingListService.removeCandidate(client.id);
    this.socketService.send(
      interviewerGroup,
      CommunicationEvents.CANDIDATE_CLOSED,
      client.id,
    );

    this.socketService.updateCandidateStatistics(
      this.watingListService.getWaitingList(),
    );
  }

  async announceNewCandidate(client: Socket) {
    const updatedCandidateList = this.watingListService.getWaitingList();
    await this.socketService.updateCandidateStatistics(updatedCandidateList);
    this.socketService.send(
      interviewerGroup,
      CommunicationEvents.ADD_TO_WAITING,
      client.id,
    );
  }

  async removeCurrentCandidate() {
    const currentCandidate = (
      await this.socketService.findSocketById(
        this.watingListService.currentCandidate,
      )
    )?.[0];
    if (currentCandidate) {
      this.msService.closeUserTransports(currentCandidate.id);
      this.socketService.send(
        interviewerGroup,
        CommunicationEvents.PRODUCER_CLOSED,
        currentCandidate.id,
      );
      this.socketService.send(
        currentCandidate.id,
        CommunicationEvents.INTERVIEW_FINISHED,
      );
    }
  }

  announceMovingToNextCandidate(nextCandidate: string) {
    this.watingListService.currentCandidate = nextCandidate;
    this.watingListService.removeCandidate(nextCandidate);
    this.socketService.updateCandidateStatistics(
      this.watingListService.getWaitingList(),
    );

    this.socketService.send(
      nextCandidate,
      CommunicationEvents.READY_FOR_INTERVIEW,
    );
    this.socketService.send(
      interviewerGroup,
      CommunicationEvents.NEXT_CANDIDATE,
    );
  }
}
