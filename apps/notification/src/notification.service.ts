import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  CHAIN_EVENTS_QUEUE_NOTIFICATION,
  ChainEventMessage,
  RabbitMqService,
  RedisService,
} from '../../../libs/common/src';
import { PrismaService } from '../../../libs/prisma/src/prisma.service';

@Injectable()
export class NotificationService implements OnModuleInit {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly rabbit: RabbitMqService,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async onModuleInit() {
    await this.rabbit.consume(CHAIN_EVENTS_QUEUE_NOTIFICATION, (msg) => this.handle(msg));
  }

  private async handle(msg: ChainEventMessage) {
    const address = (msg.account || '').toLowerCase();
    const title =
      msg.eventName === 'ValueSet' ? 'Registry value set' : 'Registry value cleared';
    const body =
      msg.eventName === 'ValueSet'
        ? `Value "${msg.value}" recorded (entry #${msg.entryId})`
        : `Value cleared for ${address}`;

    let userId: string | undefined;
    if (address) {
      const user = await this.prisma.user.upsert({
        where: { address },
        create: { address },
        update: {},
      });
      userId = user.id;
    }

    const notification = await this.prisma.notification.create({
      data: {
        userId,
        address: address || 'unknown',
        title,
        body,
        metadata: msg.raw,
      },
    });

    await this.redis.setJson(
      `notification:latest:${address || 'unknown'}`,
      notification,
      3600,
    );

    this.logger.log(`[notify] ${title} → ${address || 'unknown'}`);
  }
}
