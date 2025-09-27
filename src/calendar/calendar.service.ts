import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { getDay, startOfDay, endOfDay, parse } from 'date-fns';

@Injectable()
export class CalendarService {
  constructor(private prisma: PrismaService) {}

  /**
   * Získá dostupné časové sloty pro daného terapeuta a datum.
   */
  async getTherapistAvailabilityForDate(therapistId: number, date: Date) {
    const dayOfWeek = getDay(date); // 0 = neděle, 1 = pondělí, ...
    const startOfDayDate = startOfDay(date);
    const endOfDayDate = endOfDay(date);

    // 1. Najdi obecnou pracovní dobu terapeuta pro daný den v týdnu
    const workSchedule = await this.prisma.workSchedule.findFirst({
      where: {
        therapistId: therapistId,
        dayOfWeek: dayOfWeek,
      },
    });

    if (!workSchedule) {
      return []; // Terapeut tento den v týdnu nepracuje
    }

    // 2. Najdi všechny rezervace a blokace na daný den
    const reservations = await this.prisma.reservation.findMany({
      where: {
        therapistId: therapistId,
        startTime: {
          gte: startOfDayDate,
          lt: endOfDayDate,
        },
      },
    });

    const timeBlocks = await this.prisma.timeBlock.findMany({
      where: {
        therapistId: therapistId,
        startTime: {
          gte: startOfDayDate,
          lt: endOfDayDate,
        },
      },
    });

    // Spojíme všechny "nedostupné" časy do jednoho pole
    const unavailableSlots = [
        ...reservations.map(r => ({ start: r.startTime, end: r.endTime })),
        ...timeBlocks.map(b => ({ start: b.startTime, end: b.endTime }))
    ];

    // Zde by následovala logika pro generování volných slotů
    // na základě pracovní doby a nedostupných časů.
    // Pro zjednodušení vrátíme zatím jen obecné informace.
    
    return {
      workSchedule,
      unavailableSlots,
    };
  }
}