import { Body, Controller, Post } from '@nestjs/common';
import { PrismaService } from '../../../libs/prisma/src/prisma.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly prisma: PrismaService) {}

  /** Wallet auth stub — upserts a user by address. Replace with SIWE later. */
  @Post('wallet')
  async walletAuth(@Body() body: { address: string }) {
    const address = body.address?.toLowerCase();
    if (!address) {
      return { error: 'address required' };
    }
    const user = await this.prisma.user.upsert({
      where: { address },
      create: { address },
      update: {},
    });
    return { user, token: `stub-${user.id}` };
  }
}
