// src/reservations/reservations.service.ts
import { Injectable } from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

  create(createReservationDto: CreateReservationDto) {
    return this.prisma.reservation.create({
      data: createReservationDto,
    });
  }

  findAll(startDate?: string, endDate?: string) {
    return this.prisma.reservation.findMany({
      where: {
        startTime: {
          gte: startDate ? new Date(startDate) : undefined,
        },
        endTime: {
          lte: endDate ? new Date(endDate) : undefined,
        },
      },
      include: {
        therapist: {
          select: { firstName: true, lastName: true },
        },
        client: {
          select: { firstName: true, lastName: true },
        },
      },
    });
  }

  findOne(id: number) {
    return this.prisma.reservation.findUnique({ where: { id } });
  }

  update(id: number, updateReservationDto: UpdateReservationDto) {
    return this.prisma.reservation.update({
      where: { id },
      data: updateReservationDto,
    });
  }

  remove(id: number) {
    return this.prisma.reservation.delete({ where: { id } });
  }
}