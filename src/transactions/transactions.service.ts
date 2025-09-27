import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionItemDto } from './dto/create-transaction-item.dto';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(createTransactionDto: CreateTransactionDto) {
    const { clientId, paymentMethod, items } = createTransactionDto;

    // Krok 1: Vypočítáme celkovou cenu z položek, ale zatím ji neukládáme.
    // Transakci vytvoříme s počáteční cenou 0 a budeme ji aktualizovat.
    const newTransaction = await this.prisma.transaction.create({
      data: {
        clientId,
        paymentMethod,
        total: 0, // Začínáme s nulovou cenou
        status: 'PENDING', // Nová transakce je ve stavu PENDING
      },
    });

    // Krok 2: Přidáme jednotlivé položky a zároveň aktualizujeme celkovou cenu.
    let finalTotal = 0;
    for (const item of items) {
      const newItem = await this.addItemToTransaction(newTransaction.id, item);
      finalTotal += newItem.price * newItem.quantity;
    }

    // Krok 3: Aktualizujeme transakci s finální cenou a stavem.
    return this.prisma.transaction.update({
      where: { id: newTransaction.id },
      data: {
        total: finalTotal,
        status: 'COMPLETED',
      },
      include: { items: true },
    });
  }

  async addItemToTransaction(
    transactionId: number,
    itemDto: CreateTransactionItemDto,
  ) {
    if (!itemDto.productId && !itemDto.serviceId) {
      throw new BadRequestException(
        'Musí být poskytnuto buď ID produktu, nebo služby.',
      );
    }
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });
    if (!transaction) {
      throw new NotFoundException(
        `Transakce s ID ${transactionId} nebyla nalezena.`,
      );
    }

    let itemName: string, itemPrice: number;
    if (itemDto.productId) {
      const product = await this.prisma.product.findUnique({
        where: { id: itemDto.productId },
      });
      if (!product)
        throw new NotFoundException(
          `Produkt s ID ${itemDto.productId} nebyl nalezen.`,
        );
      itemName = product.name;
      itemPrice = product.price;
    } else {
      const service = await this.prisma.service.findUnique({
        where: { id: itemDto.serviceId },
      });
      if (!service)
        throw new NotFoundException(
          `Služba s ID ${itemDto.serviceId} nebyla nalezena.`,
        );
      itemName = service.name;
      itemPrice = service.price;
    }

    const newItem = await this.prisma.transactionItem.create({
      data: {
        transactionId,
        productId: itemDto.productId,
        serviceId: itemDto.serviceId,
        quantity: itemDto.quantity,
        name: itemName,
        price: itemPrice,
      },
    });

    // Po přidání položky rovnou aktualizujeme celkovou cenu transakce
    const newTotal = transaction.total + newItem.price * newItem.quantity;
    await this.prisma.transaction.update({
      where: { id: transactionId },
      data: { total: newTotal },
    });

    return newItem;
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
    // Remove undefined properties so Prisma doesn't get them
    const data = Object.fromEntries(
      Object.entries(updateTransactionDto).filter(([_, v]) => v !== undefined)
    );
    return this.prisma.transaction.update({
      where: { id },
      data,
    });
  }
  remove(id: number) {
    return this.prisma.transaction.delete({ where: { id } });
  }
}
