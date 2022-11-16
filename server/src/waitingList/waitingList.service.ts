import { Injectable } from '@nestjs/common';
import { Queue } from 'src/utils/utils';

@Injectable()
export class WaitingListService {
  waitingList = new Queue<string>();
  currentCandidate: string = null;

  getWaitingList() {
    return this.waitingList.content;
  }

  addToWaitingList(clientId: string) {
    this.waitingList.push(clientId);
    return this.waitingList.content;
  }

  removeCandidate(clientId: string) {
    return this.waitingList.remove(clientId);
  }

  getNextCandidate() {
    return this.waitingList.front();
  }
}
