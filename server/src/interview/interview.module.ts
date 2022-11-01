import { Module } from '@nestjs/common';
import { InterviewService } from './interview.service';

@Module({
  providers: [InterviewService],
  exports: [InterviewService],
})
export class InterviewModule {}
