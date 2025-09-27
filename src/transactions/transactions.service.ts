import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransactionItemDto } from './dto/create-transaction-item.dto';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  create(createTransactionDto: CreateTransactionDto) {
    // Zde bude logika pro vytvoření celé transakce
    return 'This action adds a new transaction';
  }

  async addItemToTransaction(
    transactionId: number,
    itemDto: CreateTransactionItemDto,
  ) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });
    if (!transaction) {
      throw new NotFoundException(`Transakce s ID ${transactionId} nebyla nalezena.`);
    }

    const product = await this.prisma.product.findUnique({
      where: { id: itemDto.productId },
    });
    if (!product) {
      throw new NotFoundException(`Produkt s ID ${itemDto.productId} nebyl nalezen.`);
    }

    // Zde bude logika pro přidání položky a přepočítání ceny transakce
    return this.prisma.transactionItem.create({
      data: {
        transactionId: transactionId,
        productId: itemDto.productId,
        quantity: itemDto.quantity,
        name: product.name,
        price: product.price,
      },
    });
  }

  findAll() {
    return this.prisma.transaction.findMany();
  }

  findOne(id: number) {
    return this.prisma.transaction.findUnique({ where: { id } });
  }

  update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} transaction`;
  }
}