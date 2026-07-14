import { Controller, Get, Param, Query } from '@nestjs/common';
import { PrismaService } from '../../../libs/prisma/src/prisma.service';
import { RedisService } from '../../../libs/common/src/redis';

@Controller('events')
export class EventsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Get()
  async list(
    @Query('account') account?: string,
    @Query('limit') limit = '50',
  ) {
    const take = Math.min(Number(limit) || 50, 100);
    const cacheKey = `events:list:${account || 'all'}:${take}`;
    const cached = await this.redis.getJson<unknown[]>(cacheKey);
    if (cached) {
      return { source: 'cache', data: cached };
    }

    const data = await this.prisma.indexedEvent.findMany({
      where: account ? { account: account.toLowerCase() } : undefined,
      orderBy: { blockNumber: 'desc' },
      take,
    });

    await this.redis.setJson(cacheKey, data, 30);
    return { source: 'db', data };
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.prisma.indexedEvent.findUnique({ where: { id } });
  }
}
