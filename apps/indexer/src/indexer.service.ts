import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  CHAIN_EVENTS_QUEUE_INDEXER,
  ChainEventMessage,
  RabbitMqService,
  RedisService,
} from '../../../libs/common/src';
import { PrismaService } from '../../../libs/prisma/src/prisma.service';

@Injectable()
export class IndexerService implements OnModuleInit {
  private readonly logger = new Logger(IndexerService.name);

  constructor(
    private readonly rabbit: RabbitMqService,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async onModuleInit() {
    await this.rabbit.consume(CHAIN_EVENTS_QUEUE_INDEXER, (msg) => this.handle(msg));
  }

  private async handle(msg: ChainEventMessage) {
    await this.prisma.indexedEvent.upsert({
      where: {
        txHash_logIndex: {
          txHash: msg.txHash,
          logIndex: msg.logIndex,
        },
      },
      create: {
        txHash: msg.txHash,
        logIndex: msg.logIndex,
        blockNumber: BigInt(msg.blockNumber),
        contractAddress: msg.contractAddress,
        eventName: msg.eventName,
        account: msg.account,
        value: msg.value,
        entryId: msg.entryId ? BigInt(msg.entryId) : null,
        payload: msg.raw as Prisma.InputJsonValue,
      },
      update: {},
    });

    await this.prisma.syncCursor.upsert({
      where: { key: 'simple-registry' },
      create: {
        key: 'simple-registry',
        blockNumber: BigInt(msg.blockNumber),
      },
      update: {
        blockNumber: BigInt(msg.blockNumber),
      },
    });

    const keys = await this.redis.client.keys('events:list:*');
    if (keys.length) {
      await this.redis.client.del(...keys);
    }

    this.logger.log(`Indexed ${msg.eventName} ${msg.txHash}:${msg.logIndex}`);
  }
}
