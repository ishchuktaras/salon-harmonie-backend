// src/reservations/reservations.service.ts
import { Injectable } from '@nestjs/common';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from 'src/mail/mail.service'; 

@Injectable()
export class ReservationsService {
  // Upravili jsme konstruktor, aby si "vstříknul" novou službu
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async create(createReservationDto: CreateReservationDto) {
    // Vytvoříme rezervaci a rovnou si načteme i propojená data,
    // která potřebujeme pro e-mail (klient, služba, terapeut).
    const newReservation = await this.prisma.reservation.create({
      data: createReservationDto,
      include: {
        client: true,
        service: true,
        therapist: true,
      },
    });

    // Zavoláme naši novou funkci pro odeslání e-mailu
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