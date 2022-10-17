import { Module } from '@nestjs/common';
import { MsService } from './ms.service';
// import { CoreService } from './core.service';
// import { RouterService } from './router.service';

@Module({
  providers: [MsService],
  exports: [MsService],
})
export class MsModule {}
