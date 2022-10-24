import { Module } from '@nestjs/common';
import { SignalingService } from './signaling.service';
import { SignalingGateway } from './signaling.gateway';
import { MsService } from 'src/plugin/ms.service';
import { MsModule } from 'src/plugin/ms.module';

@Module({
  imports: [MsModule],
  providers: [SignalingGateway, SignalingService, MsService],
})
export class SignalingModule {}
