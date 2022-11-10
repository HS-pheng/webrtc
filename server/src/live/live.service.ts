import { Injectable } from '@nestjs/common';
import { MsService } from 'src/mediasoup/ms.service';
import { Socket } from 'socket.io';
import { WaitingListService } from 'src/waitingList/waitingList.service';
import { SocketService } from 'src/socket/socket.service';
import { interviewerGroup } from 'src/socket/socket.constant';

@Injectable()
export class LiveService {
  constructor(
    private msService: MsService,
    private watingListService: WaitingListService,
    private socketService: SocketService,
  ) {}

  msDisconnectionCleanup(client: Socket) {
    this.msService.closeUserTransports(client.id);
    const currentCandidate = this.watingListService.currentCandidate;
    client
      .to(interviewerGroup)
      .to(currentCandidate)
      .emit('producer-closed', client.id);
  }

  interviewDisconnectionCleanup(client: Socket) {
    this.watingListService.removeCandidate(client.id);
    this.socketService.send(interviewerGroup, 'candidate-closed', client.id);

    this.socketService.updateCandidateStatistics(
      this.watingListService.getWaitingList(),
    );
  }

  async announceNewCandidate(client: Socket) {
    const updatedCandidateList = this.watingListService.getWaitingList();
    await this.socketService.updateCandidateStatistics(updatedCandidateList);
    this.socketService.send(interviewerGroup, 'add-to-waiting', client.id);
  }

  async removeCurrentCandidate() {
    const currentCandidate = (
      await this.socketService.findSocketById(
        this.watingListService.currentCandidate,
      )
    )?.[0];
    if (currentCandidate) {
      this.msService.closeUserTransports(currentCandidate.id);
      this.socketService.server.emit('producer-closed', currentCandidate.id);
      this.socketService.send(currentCandidate.id, 'interview-finished');
    }
  }

  announceMovingToNextCandidate(nextCandidate: string) {
    this.watingListService.currentCandidate = nextCandidate;
    this.watingListService.removeCandidate(nextCandidate);
    this.socketService.updateCandidateStatistics(
      this.watingListService.getWaitingList(),
    );

    this.socketService.send(nextCandidate, 'ready-for-interview');
    this.socketService.send(interviewerGroup, 'next-candidate');
  }
}
