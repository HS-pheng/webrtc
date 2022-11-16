import { Module } from '@nestjs/common';
import { WaitingListModule } from 'src/waitingList/waitingList.module';
import { SocketService } from './socket.service';

@Module({
  imports: [WaitingListModule],
  providers: [SocketService],
  exports: [SocketService],
})
export class SignalingModule {}
