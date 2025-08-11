// src/calendar/calendar.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { addMinutes, format, isWithinInterval, parse } from 'date-fns';

@Injectable()
export class CalendarService {
  constructor(private prisma: PrismaService) {}

  async getAvailability(therapistId: number, serviceId: number, date: string) {
    const requestedDate = new Date(date);
    const dayOfWeek = requestedDate.getDay();

    const [service, workSchedule, reservations, timeBlocks] = await Promise.all([
      this.prisma.service.findUnique({ where: { id: serviceId } }),
      this.prisma.workSchedule.findFirst({
        where: { therapistId, dayOfWeek },
      }),
      this.prisma.reservation.findMany({
        where: {
          therapistId,
          startTime: {
            gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
            lt: new Date(new Date(date).setHours(23, 59, 59, 999)),
          },
        },
      }),
      this.prisma.timeBlock.findMany({
        where: {
          therapistId,
          startTime: {
            gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
            lt: new Date(new Date(date).setHours(23, 59, 59, 999)),
          },
        },
      }),
    ]);

    if (!service) {
      throw new NotFoundException(`Služba s ID ${serviceId} nebyla nalezena.`);
    }
    if (!workSchedule) {
      return []; // Terapeut v tento den nepracuje, vrátíme prázdné pole
    }

    const availableSlots: string[] = [];
    const dayStart = parse(workSchedule.startTime, 'HH:mm', requestedDate);
    const dayEnd = parse(workSchedule.endTime, 'HH:mm', requestedDate);
    let currentSlot = dayStart;

    while (currentSlot < dayEnd) {
      const slotEnd = addMinutes(currentSlot, service.duration);
      if (slotEnd > dayEnd) break;

      const slotInterval = { start: currentSlot, end: slotEnd };

      const reservationOverlap = reservations.some(
        (res) =>
          isWithinInterval(new Date(res.startTime), slotInterval) ||
          isWithinInterval(new Date(res.endTime), slotInterval) ||
          (new Date(res.startTime) < slotInterval.start && new Date(res.endTime) > slotInterval.end),
      );

      const blockOverlap = timeBlocks.some(
        (block) =>
          isWithinInterval(new Date(block.startTime), slotInterval) ||
          isWithinInterval(new Date(block.endTime), slotInterval) ||
          (new Date(block.startTime) < slotInterval.start && new Date(block.endTime) > slotInterval.end),
      );

      if (!reservationOverlap && !blockOverlap) {
        availableSlots.push(format(currentSlot, 'HH:mm'));
      }

      currentSlot = addMinutes(currentSlot, 15);
    }

    return availableSlots;
  }

  // --- NOVÝ ENDPOINT PRO ZOBRAZENÍ KALENDÁŘE PRO MANAGERY ---
  async getManagerView(startDate: string, endDate: string) {
    const therapists = await this.prisma.user.findMany({
      where: {
        role: {
          in: ['TERAPEUT', 'MASER'],
        },
      },
      include: {
        reservationsAsTherapist: {
          where: {
            startTime: {
              gte: new Date(startDate),
            },
            endTime: {
              lte: new Date(endDate),
            },
          },
          include: {
            client: true,
            service: true,
          },
        },
      },
    });

    return therapists.map((therapist) => {
      const { passwordHash, ...result } = therapist;
      return result;
    });
  }
}