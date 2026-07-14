import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule } from '../../../libs/prisma/src/prisma.module';
import { EventsController } from './events.controller';
import { HealthController } from './health.controller';
import { NotificationsController } from './notifications.controller';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CommonModule,
    PrismaModule,
  ],
  controllers: [HealthController, AuthController, EventsController, NotificationsController],
})
export class AppModule {}
