import { Module } from '@nestjs/common';
import { SignalingService } from './signaling.service';

@Module({
  providers: [SignalingService],
  exports: [SignalingService],
})
export class SignalingModule {}
