// src/schedule/schedule.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateWorkScheduleDto } from './dto/create-schedule.dto';
import { CreateTimeBlockDto } from './dto/create-time-block.dto';

@Injectable()
export class ScheduleService {
  constructor(private prisma: PrismaService) {}

  // --- Metody pro Pracovní Dobu ---
  createWorkSchedule(dto: CreateWorkScheduleDto, therapistId: number) {
    return this.prisma.workSchedule.create({
      data: {
        ...dto,
        therapistId,
      },
    });
  }

  getWorkScheduleForUser(therapistId: number) {
    return this.prisma.workSchedule.findMany({
      where: { therapistId },
    });
  }

  deleteWorkSchedule(id: number) {
    return this.prisma.workSchedule.delete({ where: { id } });
  }

  // --- Metody pro Časové Blokace ---
  createTimeBlock(dto: CreateTimeBlockDto, therapistId: number) {
    return this.prisma.timeBlock.create({
      data: {
        ...dto,
        therapistId,
      },
    });
  }

  getTimeBlocksForUser(therapistId: number) {
    return this.prisma.timeBlock.findMany({
      where: { therapistId },
    });
  }

  deleteTimeBlock(id: number) {
    return this.prisma.timeBlock.delete({ where: { id } });
  }
}