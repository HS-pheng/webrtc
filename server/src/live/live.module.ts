import { Module } from '@nestjs/common';
import { LiveGateway } from './live.gateway';
import { MsModule } from 'src/mediasoup/ms.module';
import { SignalingModule } from 'src/socket/socket.module';
import { InterviewModule } from 'src/interview/interview.module';
import { LiveService } from './live.service';

@Module({
  imports: [MsModule, SignalingModule, InterviewModule],
  providers: [LiveGateway, LiveService],
})
export class LiveModule {}
