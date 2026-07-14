import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RabbitMqService } from './rabbitmq';
import { RedisService } from './redis';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [RabbitMqService, RedisService],
  exports: [RabbitMqService, RedisService],
})
export class CommonModule {}
