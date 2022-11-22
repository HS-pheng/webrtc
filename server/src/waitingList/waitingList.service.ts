import { Injectable } from '@nestjs/common';
import { candidateInfo } from 'src/constants/types';
import { Queue } from 'src/utils/utils';

@Injectable()
export class WaitingListService {
  waitingList = new Queue<candidateInfo>();
  currentCandidate: candidateInfo = null;

  getWaitingList() {
    return this.waitingList.content;
  }

  addToWaitingList(candidate: candidateInfo) {
    this.waitingList.push(candidate);
    return this.waitingList.content;
  }

  removeCandidate(candidateId: string) {
    return this.waitingList.removeBy('id', candidateId);
  }

  getNextCandidate() {
    return this.waitingList.front();
  }
}
