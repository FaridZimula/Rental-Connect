import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CreditsService {
  constructor(private prisma: PrismaService) {}

  async getBalance(userId: string): Promise<number> {
    const wallet = await this.prisma.creditWallet.findUnique({ where: { user_id: userId } });
    return wallet?.balance ?? 0;
  }

  async addCredits(userId: string, amount: number, txRef?: string) {
    const wallet = await this.prisma.creditWallet.upsert({
      where: { user_id: userId },
      create: { user_id: userId, balance: amount },
      update: { balance: { increment: amount } },
    });

    await this.prisma.creditTransaction.create({
      data: {
        wallet_id: wallet.id,
        type: 'purchase',
        amount,
        transaction_ref: txRef,
      },
    });

    return wallet;
  }

  async getTransactions(userId: string) {
    const wallet = await this.prisma.creditWallet.findUnique({ where: { user_id: userId } });
    if (!wallet) return [];
    return this.prisma.creditTransaction.findMany({
      where: { wallet_id: wallet.id },
      orderBy: { created_at: 'desc' },
      take: 50,
    });
  }
}
