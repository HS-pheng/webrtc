import { Module } from '@nestjs/common';
import { LiveGateway } from './live.gateway';
import { MsModule } from 'src/mediasoup/ms.module';
import { SignalingModule } from 'src/signaling/signaling.module';

@Module({
  imports: [MsModule, SignalingModule],
  providers: [LiveGateway],
})
export class LiveModule {}
