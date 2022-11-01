import { Module } from '@nestjs/common';
import { LiveGateway } from './live.gateway';
import { MsModule } from 'src/mediasoup/ms.module';
import { SignalingModule } from 'src/socket/socket.module';
import { InterviewModule } from 'src/interview/interview.module';

@Module({
  imports: [MsModule, SignalingModule, InterviewModule],
  providers: [LiveGateway],
})
export class LiveModule {}
