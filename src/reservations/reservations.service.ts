// src/reservations/reservations.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class ReservationsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async create(createReservationDto: CreateReservationDto) {
    const newReservation = await this.prisma.reservation.create({
      data: createReservationDto,
      include: {
        client: true,
        service: true,
        therapist: true,
      },
    });

    await this.mailService.sendReservationConfirmation(newReservation);
    return newReservation;
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

  async findOne(id: number) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
    });
    if (!reservation) {
      throw new NotFoundException(`Rezervace s ID ${id} nebyla nalezena.`);
    }
    return reservation;
  }

  // --- TUTO METODU VYLEPŠUJEME ---
  async update(id: number, updateReservationDto: UpdateReservationDto) {
    // Zde by v budoucnu měla být i kontrola, jestli nový čas nekoliduje s jinou rezervací
    return this.prisma.reservation.update({
      where: { id },
      data: updateReservationDto,
    });
  }

  remove(id: number) {
    return this.prisma.reservation.delete({ where: { id } });
  }
}
