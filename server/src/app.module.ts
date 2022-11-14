import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'libs/snake-naming.strategy';
import { ListingsModule } from './listings/listings.module';
import { LiveModule } from './live/live.module';

@Module({
  imports: [
    LiveModule,
    ListingsModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'db',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'webrtc-prototype',
      namingStrategy: new SnakeNamingStrategy(),
      autoLoadEntities: true,
      synchronize: false,
    }),
  ],
})
export class AppModule {}
