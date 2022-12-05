import { Injectable } from '@nestjs/common';
import { MsService } from 'src/mediasoup/ms.service';
import { Socket } from 'socket.io';
import { WaitingListService } from 'src/waitingList/waitingList.service';
import { SocketService } from 'src/socket/socket.service';
import { interviewerGroup } from 'src/socket/socket.constant';
import { CommunicationEvents } from 'src/constants/events';
import { candidateInfo } from 'src/constants/types';

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

    const newCandidateInfo: candidateInfo = {
      id: client.id,
      username: client.data.handshakeData.username,
    };
    this.socketService.send(
      interviewerGroup,
      CommunicationEvents.ADD_TO_WAITING,
      newCandidateInfo,
    );
  }

  async removeCurrentCandidate() {
    const currentCandidate = (
      await this.socketService.findSocketById(
        this.watingListService.currentCandidate?.id,
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

  announceMovingToNextCandidate(nextCandidate: candidateInfo, roomId: string) {
    this.watingListService.currentCandidate = nextCandidate;
    this.watingListService.removeCandidate(nextCandidate.id);
    this.socketService.updateCandidateStatistics(
      this.watingListService.getWaitingList(),
    );

    this.socketService.send(
      nextCandidate.id,
      CommunicationEvents.READY_FOR_INTERVIEW,
      roomId,
    );
    this.socketService.send(
      interviewerGroup,
      CommunicationEvents.NEXT_CANDIDATE,
    );
  }
}
