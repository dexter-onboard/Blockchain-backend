import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { PrismaService } from '../../../libs/prisma/src/prisma.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(@Query('address') address?: string, @Query('limit') limit = '50') {
    const take = Math.min(Number(limit) || 50, 100);
    return this.prisma.notification.findMany({
      where: address ? { address: address.toLowerCase() } : undefined,
      orderBy: { createdAt: 'desc' },
      take,
    });
  }

  @Patch(':id/read')
  async markRead(@Param('id') id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }
}
