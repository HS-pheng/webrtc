import { Module } from '@nestjs/common';
import { WaitingListService } from './waitingList.service';

@Module({
  providers: [WaitingListService],
  exports: [WaitingListService],
})
export class InterviewModule {}
