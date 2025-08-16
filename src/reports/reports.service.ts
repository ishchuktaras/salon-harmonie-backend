// src/reports/reports.service.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AbraFlexiService } from 'src/abra-flexi/abra-flexi.service';
import { Transaction } from '@prisma/client';
import { startOfDay, endOfDay, subDays } from 'date-fns';
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

    await this.abraFlexiService.sendDailySummary(totalRevenue, date);

    return {
      message: `Uzávěrka pro den ${date} byla úspěšně provedena.`,
      totalRevenue: totalRevenue / 100, // cena je v haléřích
      closedCount: transactionsToClose.length,
    };
  }

  
  async getDashboardSummary() {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());
    const sevenDaysAgo = subDays(new Date(), 7);

    // Počet dnešních rezervací
    const upcomingReservations = await this.prisma.reservation.count({
      where: {
        startTime: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    });

    // Počet nových klientů za poslední týden
    const newClients = await this.prisma.client.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    // Dnešní tržby
    const transactionsToday = await this.prisma.transaction.findMany({
      where: {
        createdAt: {
          gte: todayStart,
          lte: todayEnd,
        },
        status: 'COMPLETED',
      },
    });
    const dailyRevenue = transactionsToday.reduce(
      (sum, transaction) => sum + transaction.total,
      0,
    );

    // Vytíženost je složitější, prozatím vrátíme statickou hodnotu
    const therapistUtilization = 75; // TODO: Implementovat logiku výpočtu

    return {
      upcomingReservations,
      newClients,
      dailyRevenue: dailyRevenue, // Vracíme v haléřích, frontend si to převede
      therapistUtilization,
    };
  }
}