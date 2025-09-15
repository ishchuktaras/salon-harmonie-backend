import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { startOfToday, endOfToday, startOfYesterday, endOfYesterday, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { Role } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Získá komplexní souhrn dat pro hlavní stránku dashboardu.
   */
  async getDashboardSummary() {
    const todayStart = startOfToday();
    const todayEnd = endOfToday();
    const yesterdayStart = startOfYesterday();
    const yesterdayEnd = endOfYesterday();
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Týden začíná pondělím
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

    // Použijeme Promise.all pro paralelní spuštění všech dotazů pro maximální rychlost.
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
      // 1. Dnešní tržby
      this.prisma.transaction.aggregate({
        _sum: { total: true },
        where: { createdAt: { gte: todayStart, lte: todayEnd }, status: { not: 'CANCELLED' } },
      }),
      // 2. Včerejší tržby
      this.prisma.transaction.aggregate({
        _sum: { total: true },
        where: { createdAt: { gte: yesterdayStart, lte: yesterdayEnd }, status: { not: 'CANCELLED' } },
      }),
      // 3. Dnešní rezervace
      this.prisma.reservation.count({
        where: { createdAt: { gte: todayStart, lte: todayEnd } },
      }),
      // 4. Včerejší rezervace
      this.prisma.reservation.count({
        where: { createdAt: { gte: yesterdayStart, lte: yesterdayEnd } },
      }),
      // 5. Nadcházející rezervace pro dnešek
      this.prisma.reservation.findMany({
          where: { startTime: { gte: new Date(), lte: todayEnd } },
          orderBy: { startTime: 'asc' },
          take: 5,
          include: { client: true, service: true },
      }),
      // 6. Nejvytíženější terapeut tohoto týdne
      this.prisma.reservation.groupBy({
          by: ['therapistId'],
          _count: { _all: true },
          where: { startTime: { gte: weekStart, lte: weekEnd } },
          orderBy: { _count: { id: 'desc' } },
          take: 1,
      }),
      // 7. Nejpopulárnější služba tohoto týdne
      this.prisma.reservation.groupBy({
          by: ['serviceId'],
          _count: { _all: true },
          where: { startTime: { gte: weekStart, lte: weekEnd } },
          orderBy: { _count: { id: 'desc' } },
          take: 1,
      }),
      // 8. Data pro graf tržeb za poslední týden
      this.prisma.transaction.groupBy({
        by: ['createdAt'],
        _sum: { total: true },
        where: { createdAt: { gte: subDays(new Date(), 7) } },
        orderBy: { createdAt: 'asc' },
      })
    ]);

    // Zpracování a výpočty
    const todaySales = todaySalesData._sum.total || 0;
    const yesterdaySales = yesterdaySalesData._sum.total || 0;
    
    const salesChangePercentage = yesterdaySales > 0 
      ? ((todaySales - yesterdaySales) / yesterdaySales) * 100 
      : todaySales > 0 ? 100 : 0;
      
    const reservationsChangeCount = todayReservationsCount - yesterdayReservationsCount;
    
    // Získání detailů o terapeutovi a službě
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
      weeklySalesData: weeklySalesData.map(d => ({ date: d.createdAt.toISOString().split('T')[0], total: d._sum.total })), // Formát pro graf
    };
  }

  // Zde ponecháme stávající metodu pro denní uzávěrku
  async performDailyCloseout(date: string) {
    // ... stávající kód pro performDailyCloseout ...
  }
}

