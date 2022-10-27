import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListingsController } from './listings.controller';
import { Listing } from './listings.entity';
import { ListingsService } from './listings.service';

@Module({
  imports: [TypeOrmModule.forFeature([Listing])],
  controllers: [ListingsController],
  providers: [ListingsService],
})
export class ListingsModule {}
