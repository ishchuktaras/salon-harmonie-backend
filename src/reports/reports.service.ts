// backend/src/reports/reports.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

import { Transaction } from '@prisma/client';
import { startOfDay, endOfDay, subDays } from 'date-fns';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Provede denní uzávěrku pro zadané datum.
   */
  async performDailyCloseout(date: string) {
    const targetDate = new Date(date);
    const startDate = startOfDay(targetDate);
    const endDate = endOfDay(targetDate);

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

    const transactionIds = transactionsToClose.map((t: Transaction) => t.id);

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

    // Poznámka: Ujistěte se, že máte implementovanou metodu sendDailySummary
    // await this.abraFlexiService.sendDailySummary(totalRevenue, date);

    return {
      message: `Uzávěrka pro den ${date} byla úspěšně provedena.`,
      totalRevenue: totalRevenue, // Vracíme v haléřích
      closedCount: transactionsToClose.length,
    };
  }

  /**
   * Efektivně načte souhrnná data pro dashboard.
   */
  async getDashboardSummary() {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());
    const weekStart = startOfDay(subDays(new Date(), 7));

    const [
      dailyReservations,
      distinctClientReservations,
      dailyRevenue,
      totalTherapists,
    ] = await Promise.all([
      this.prisma.reservation.count({
        where: { startTime: { gte: todayStart, lte: todayEnd } },
      }),
      // Použijeme findMany s distinct a poté spočítáme délku pole.
      this.prisma.reservation.findMany({
        where: { startTime: { gte: weekStart, lte: todayEnd } },
        distinct: ['clientId'],
        select: {
          clientId: true,
        },
      }),
      this.prisma.transaction.aggregate({
        _sum: { total: true },
        where: {
          createdAt: { gte: todayStart, lte: todayEnd },
          status: 'COMPLETED',
        },
      }),
      this.prisma.user.count({
        where: { role: { in: ['TERAPEUT', 'MASER'] } },
      }),
    ]);

    return {
      dailyReservations,
      activeClients: distinctClientReservations.length, // Získáme počet z délky pole
      dailyRevenue: dailyRevenue._sum.total || 0,
      totalTherapists,
    };
  }
}
