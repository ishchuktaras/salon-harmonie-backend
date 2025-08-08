// src/transactions/transactions.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddTransactionItemDto } from './dto/add-item.dto';

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

  async addItem(transactionId: number, dto: AddTransactionItemDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException('Produkt nenalezen');
    }

    await this.prisma.transactionItem.create({
      data: {
        name: product.name,
        price: product.price,
        quantity: dto.quantity,
        productId: dto.productId,
        transactionId: transactionId,
      },
    });

    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { items: true },
    });

    // Zkontrolujeme, jestli transakce existuje
    if (!transaction) {
      throw new NotFoundException('Transakce po přidání položky nenalezena.');
    }

    const total = transaction.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    return this.prisma.transaction.update({
      where: { id: transactionId },
      data: { total },
      include: { items: true },
    });
  }

  findAll() {
    return this.prisma.transaction.findMany({ include: { items: true } });
  }

  findOne(id: number) {
    return this.prisma.transaction.findUnique({
      where: { id },
      include: { items: true },
    });
  }

  update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`;
  }

  remove(id: number) {
    return this.prisma.transaction.delete({ where: { id } });
  }
}