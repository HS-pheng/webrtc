import { Module } from '@nestjs/common';
import { SignalingModule } from 'src/socket/socket.module';
import { MsService } from './ms.service';

@Module({
  imports: [SignalingModule],
  providers: [MsService],
  exports: [MsService],
})
export class MsModule {}
