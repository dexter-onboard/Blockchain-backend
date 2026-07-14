import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from '../../../libs/common/src/common.module';
import { PrismaModule } from '../../../libs/prisma/src/prisma.module';
import { NotificationService } from './notification.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), CommonModule, PrismaModule],
  providers: [NotificationService],
})
export class NotificationModule {}
