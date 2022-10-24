import { Module } from '@nestjs/common';
import { SignalingModule } from 'src/signaling/signaling.module';
import { SignalingService } from 'src/signaling/signaling.service';
import { MsService } from './ms.service';

@Module({
  imports: [SignalingModule],
  providers: [MsService, SignalingService],
  exports: [MsService],
})
export class MsModule {}
