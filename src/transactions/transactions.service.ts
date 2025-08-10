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

  // --- TOTO JE NOVÁ METODA ---
  async generateReceiptHtml(id: number): Promise<string> {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        items: true,
        client: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException(`Transakce s ID ${id} nebyla nalezena.`);
    }

    const itemsHtml = transaction.items
      .map(
        (item) => `
      <tr>
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>${(item.price / 100).toFixed(2)} Kč</td>
        <td>${((item.price * item.quantity) / 100).toFixed(2)} Kč</td>
      </tr>
    `,
      )
      .join('');

    const receiptHtml = `
      <!DOCTYPE html>
      <html lang="cs">
      <head>
        <meta charset="UTF-8">
        <title>Účtenka č. ${transaction.id}</title>
        <style>
          body { font-family: sans-serif; margin: 20px; }
          .receipt { width: 300px; border: 1px solid #ccc; padding: 15px; }
          h1 { text-align: center; margin-top: 0; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { border-bottom: 1px solid #eee; padding: 8px; text-align: left; }
          .total { font-weight: bold; font-size: 1.2em; text-align: right; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <h1>Salon Harmonie</h1>
          <p><strong>Datum:</strong> ${new Date(
            transaction.createdAt,
          ).toLocaleString('cs-CZ')}</p>
          <p><strong>Zákazník:</strong> ${transaction.client.firstName} ${
            transaction.client.lastName
          }</p>
          <p><strong>Doklad č.:</strong> ${transaction.id}</p>
          <table>
            <thead>
              <tr>
                <th>Položka</th>
                <th>Ks</th>
                <th>Cena/ks</th>
                <th>Celkem</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <div class="total">
            Celkem k úhradě: ${(transaction.total / 100).toFixed(2)} Kč
          </div>
        </div>
      </body>
      </html>
    `;

    return receiptHtml;
  }
}