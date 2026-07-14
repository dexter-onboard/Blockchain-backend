import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from '../../../libs/common/src/common.module';
import { EventListenerService } from './event-listener.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), CommonModule],
  providers: [EventListenerService],
})
export class ListenerModule {}
