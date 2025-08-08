// src/transactions/transactions.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async createFromReservation(dto: CreateTransactionDto) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: dto.reservationId },
      include: {
        service: true,
      },
    });

    if (!reservation || !reservation.service) {
      throw new NotFoundException(
        'Rezervace nebo související služba nenalezena',
      );
    }

    const { service } = reservation;

    return this.prisma.transaction.create({
      data: {
        total: service.price,
        paymentMethod: dto.paymentMethod,
        clientId: reservation.clientId,
        reservationId: reservation.id,
        items: {
          create: {
            name: service.name,
            price: service.price,
            serviceId: service.id,
          },
        },
      },
      include: {
        items: true,
      },
    });
  }

  // --- DOPLNĚNÉ METODY ---
  findAll() {
    // Vrátíme všechny transakce i s jejich položkami
    return this.prisma.transaction.findMany({
      include: {
        items: true,
        client: { // Přidáme i jméno klienta
          select: { firstName: true, lastName: true }
        }
      },
    });
  }

  async findOne(id: number) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        items: true,
        client: {
          select: { firstName: true, lastName: true }
        }
      },
    });

    if (!transaction) {
      throw new NotFoundException(`Transakce s ID ${id} nebyla nalezena.`);
    }
    return transaction;
  }

  update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`; // Zatím neimplementováno
  }

  remove(id: number) {
    return this.prisma.transaction.delete({ where: { id } }); // Základní smazání
  }
}
