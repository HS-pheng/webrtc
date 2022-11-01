import { Injectable } from '@nestjs/common';
import { Queue } from 'src/utils/utils';

@Injectable()
export class InterviewService {
  waitingList = new Queue<string>();
  previousCandidate = null;

  getWaitingList() {
    return this.waitingList.content;
  }

  addToWaitingList(name: string) {
    this.waitingList.push(name);
    return this.waitingList.content;
  }

  removeCandidate(clientId) {
    return this.waitingList.remove(clientId);
  }

  getNextCandidate() {
    return this.waitingList.front();
  }

  // isCandidate, isInterviewer
}
