// src/reports/reports.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { startOfToday, endOfToday, startOfYesterday, endOfYesterday, subDays, startOfWeek, endOfWeek, startOfDay, endOfDay } from 'date-fns';
import { Role, Transaction } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Získá komplexní souhrn dat pro hlavní stránku dashboardu.
   * Přejmenováno z getDashboardSummary na getSalesReport, aby odpovídalo controlleru.
   */
  async getSalesReport() {
    const todayStart = startOfToday();
    const todayEnd = endOfToday();
    const yesterdayStart = startOfYesterday();
    const yesterdayEnd = endOfYesterday();
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Týden začíná pondělím
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

    const [
      todaySalesData,
      yesterdaySalesData,
      todayReservationsCount,
      yesterdayReservationsCount,
      upcomingReservations,
      busiestTherapist,
      mostPopularService,
      weeklySalesData,
    ] = await Promise.all([
      this.prisma.transaction.aggregate({
        _sum: { total: true },
        where: { createdAt: { gte: todayStart, lte: todayEnd }, status: { not: 'CANCELLED' } },
      }),
      this.prisma.transaction.aggregate({
        _sum: { total: true },
        where: { createdAt: { gte: yesterdayStart, lte: yesterdayEnd }, status: { not: 'CANCELLED' } },
      }),
      this.prisma.reservation.count({
        where: { createdAt: { gte: todayStart, lte: todayEnd } },
      }),
      this.prisma.reservation.count({
        where: { createdAt: { gte: yesterdayStart, lte: yesterdayEnd } },
      }),
      this.prisma.reservation.findMany({
          where: { startTime: { gte: new Date(), lte: todayEnd } },
          orderBy: { startTime: 'asc' },
          take: 5,
          include: { client: true, service: true },
      }),
      this.prisma.reservation.groupBy({
          by: ['therapistId'],
          _count: { _all: true },
          where: { startTime: { gte: weekStart, lte: weekEnd } },
          orderBy: { _count: { id: 'desc' } },
          take: 1,
      }),
      this.prisma.reservation.groupBy({
          by: ['serviceId'],
          _count: { _all: true },
          where: { startTime: { gte: weekStart, lte: weekEnd } },
          orderBy: { _count: { id: 'desc' } },
          take: 1,
      }),
      this.prisma.transaction.groupBy({
        by: ['createdAt'],
        _sum: { total: true },
        where: { createdAt: { gte: subDays(new Date(), 7) } },
        orderBy: { createdAt: 'asc' },
      })
    ]);

    const todaySales = todaySalesData._sum.total || 0;
    const yesterdaySales = yesterdaySalesData._sum.total || 0;
    
    const salesChangePercentage = yesterdaySales > 0 
      ? ((todaySales - yesterdaySales) / yesterdaySales) * 100 
      : todaySales > 0 ? 100 : 0;
      
    const reservationsChangeCount = todayReservationsCount - yesterdayReservationsCount;
    
    const therapistId = busiestTherapist[0]?.therapistId;
    const topTherapist = therapistId ? await this.prisma.user.findUnique({ where: { id: therapistId }, select: { firstName: true, lastName: true } }) : null;

    const serviceId = mostPopularService[0]?.serviceId;
    const topService = serviceId ? await this.prisma.service.findUnique({ where: { id: serviceId }, select: { name: true } }) : null;

    return {
      todaySales,
      salesChangePercentage: parseFloat(salesChangePercentage.toFixed(1)),
      todayReservationsCount,
      reservationsChangeCount,
      upcomingReservations,
      topTherapist: topTherapist ? `${topTherapist.firstName} ${topTherapist.lastName}` : 'N/A',
      topService: topService ? topService.name : 'N/A',
      weeklySalesData: weeklySalesData.map(d => ({ date: d.createdAt.toISOString().split('T')[0], total: d._sum.total })),
    };
  }

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

    // Zde bude v budoucnu volání pro odeslání do Pohody
    // await this.pohodaService.sendDailySummary(totalRevenue, date);

    return {
      message: `Uzávěrka pro den ${date} byla úspěšně provedena.`,
      totalRevenue: totalRevenue,
      closedCount: transactionsToClose.length,
    };
  }
}