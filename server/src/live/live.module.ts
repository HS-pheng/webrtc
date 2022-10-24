import { Module } from '@nestjs/common';
import { SignalingService } from '../signaling/signaling.service';
import { LiveGateway } from './live.gateway';
import { MsService } from 'src/plugin/ms.service';
import { MsModule } from 'src/plugin/ms.module';
import { SignalingModule } from 'src/signaling/signaling.module';

@Module({
  imports: [MsModule, SignalingModule],
  providers: [LiveGateway, SignalingService, MsService],
})
export class LiveModule {}
