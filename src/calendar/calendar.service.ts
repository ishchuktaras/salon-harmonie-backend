// backend/src/calendar/calendar.service.ts

import { Injectable, NotFoundException } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { Role } from "@prisma/client"
import {
  addMinutes,
  format,
  isWithinInterval,
  parse,
  startOfDay,
  endOfDay,
} from "date-fns"

@Injectable()
export class CalendarService {
  constructor(private prisma: PrismaService) {}

  /**
   * Vypočítá dostupné časové sloty pro konkrétního terapeuta, službu a den.
   * Ideální pro veřejný rezervační formulář.
   */
  async getAvailability(therapistId: number, serviceId: number, date: string) {
    const requestedDate = new Date(date)
    const dayOfWeek = requestedDate.getDay() // Sunday - 0, Monday - 1, etc.

    const [service, workSchedule, reservations, timeBlocks] =
      await Promise.all([
        this.prisma.service.findUnique({ where: { id: serviceId } }),
        
        this.prisma.workSchedule.findFirst({
          where: { therapistId: therapistId, dayOfWeek },
        }),
        this.prisma.reservation.findMany({
          where: {
            
            therapistId: therapistId,
            startTime: {
              gte: startOfDay(requestedDate),
              lt: endOfDay(requestedDate),
            },
          },
        }),
        this.prisma.timeBlock.findMany({
          where: {
            
            therapistId: therapistId,
            startTime: {
              gte: startOfDay(requestedDate),
              lt: endOfDay(requestedDate),
            },
          },
        }),
      ])

    if (!service) {
      throw new NotFoundException(`Služba s ID ${serviceId} nebyla nalezena.`)
    }
    if (!workSchedule) {
      return [] // Terapeut v tento den nepracuje.
    }

    const availableSlots: string[] = []
    // Poznámka: Vaše schéma nemá 'startTime' a 'endTime' jako stringy, ale Prisma to zvládne
    const dayStart = parse(workSchedule.startTime, "HH:mm:ss", requestedDate)
    const dayEnd = parse(workSchedule.endTime, "HH:mm:ss", requestedDate)
    let currentSlot = dayStart

    while (currentSlot < dayEnd) {
      const slotEnd = addMinutes(currentSlot, service.duration)
      if (slotEnd > dayEnd) break

      const slotInterval = { start: currentSlot, end: slotEnd }

      const isOverlapping =
        reservations.some(
          (res) =>
            isWithinInterval(new Date(res.startTime), slotInterval) ||
            isWithinInterval(new Date(res.endTime), slotInterval) ||
            (new Date(res.startTime) < slotInterval.start &&
              new Date(res.endTime) > slotInterval.end),
        ) ||
        timeBlocks.some(
          (block) =>
            isWithinInterval(new Date(block.startTime), slotInterval) ||
            isWithinInterval(new Date(block.endTime), slotInterval) ||
            (new Date(block.startTime) < slotInterval.start &&
              new Date(block.endTime) > slotInterval.end),
        )

      if (!isOverlapping) {
        availableSlots.push(format(currentSlot, "HH:mm"))
      }

      currentSlot = addMinutes(currentSlot, 15) // Posun o 15 minut pro další slot
    }

    return availableSlots
  }

  /**
   * Získá všechna data potřebná pro zobrazení manažerského kalendáře.
   * Vrací terapeuty a všechny jejich události (rezervace, blokace) v daném období.
   */
  async getManagerView(startDate: string, endDate: string) {
    const start = new Date(startDate)
    const end = new Date(endDate)

    const [therapists, reservations, timeBlocks] = await Promise.all([
      this.prisma.user.findMany({
        where: {
          role: {
            
            in: [Role.TERAPEUT, Role.MASER],
          },
        },
        select: {
          id: true,
          
          firstName: true,
          lastName: true,
        },
      }),
      this.prisma.reservation.findMany({
        where: {
          startTime: { gte: start },
          endTime: { lte: end },
        },
        include: {
          client: true,
          service: true,
          therapist: { select: { firstName: true, lastName: true } },
        },
      }),
      this.prisma.timeBlock.findMany({
        where: {
          startTime: { gte: start },
          endTime: { lte: end },
        },
        include: {
          therapist: { select: { firstName: true, lastName: true } },
        },
      }),
    ])

    return {
      therapists,
      reservations,
      timeBlocks,
    }
  }
}
