// src/reports/reports.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async performDailyCloseout(date: string) {
    const targetDate = new Date(date);
    const startDate = new Date(targetDate.setHours(0, 0, 0, 0));
    const endDate = new Date(targetDate.setHours(23, 59, 59, 999));

    // 1. Najdeme všechny dokončené transakce pro daný den
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
      return { message: 'Žádné transakce k uzávěrce.', totalRevenue: 0, closedCount: 0 };
    }

    // 2. Sečteme jejich celkovou hodnotu
    const totalRevenue = transactionsToClose.reduce(
      (sum, transaction) => sum + transaction.total,
      0,
    );

    const transactionIds = transactionsToClose.map((t) => t.id);

    // 3. Aktualizujeme jejich status na "CLOSED"
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

    // Zde v budoucnu zavoláme funkci pro odeslání dat do ABRA Flexi
    // např. this.abraFlexiService.sendSummary(totalRevenue);

    return {
      message: `Uzávěrka pro den ${date} byla úspěšně provedena.`,
      totalRevenue: totalRevenue / 100, // Vracíme v korunách
      closedCount: transactionsToClose.length,
    };
  }
}