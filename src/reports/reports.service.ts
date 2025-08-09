// src/reports/reports.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AbraFlexiService } from 'src/abra-flexi/abra-flexi.service';

@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,
    private abraFlexiService: AbraFlexiService,
  ) {}

  async performDailyCloseout(date: string) {
    const targetDate = new Date(date);
    const startDate = new Date(targetDate.setHours(0, 0, 0, 0));
    const endDate = new Date(targetDate.setHours(23, 59, 59, 999));

    const transactionsToClose = await this.prisma.transaction.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    if (transactionsToClose.length === 0) {
      return {
        message: 'Žádné transakce k uzávěrce.',
        totalRevenue: 0,
        closedCount: 0,
      };
    }

    const totalRevenue = transactionsToClose.reduce(
      (sum, transaction) => sum + transaction.total,
      0,
    );

    const transactionIds = transactionsToClose.map((t) => t.id);

    await this.prisma.transaction.updateMany({
      where: {
        id: {
          in: transactionIds,
        },
      },
      data: {
        status: 'CLOSED',
      },
    });

    await this.abraFlexiService.sendDailySummary(totalRevenue, date);

    return {
      message: `Uzávěrka pro den ${date} byla úspěšně provedena.`,
      totalRevenue: totalRevenue / 100,
      closedCount: transactionsToClose.length,
    };
  }
}
