import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { PrismaService } from '../prisma/prisma.service';
// Změna zde: Importujeme správný název DTO
import { AddTransactionItemDto } from './dto/add-item.dto';
import { PohodaService } from '../pohoda/pohoda.service';
import { Client, Transaction, TransactionItem } from '@prisma/client';

// Pomocný typ, který zaručuje, že transakce obsahuje i relace
type TransactionWithDetails = Transaction & {
  items: TransactionItem[];
  client: Client;
};

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(
    private prisma: PrismaService,
    private pohodaService: PohodaService,
  ) {}

  async create(
    createTransactionDto: CreateTransactionDto,
  ): Promise<TransactionWithDetails> {
    const { items, ...transactionData } = createTransactionDto;

    // Krok 1: Vytvoření transakce v lokální databázi
    const newTransaction = await this.prisma.transaction.create({
      data: {
        ...transactionData,
        items: {
          create: items.map((item) => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            productId: item.productId,
            serviceId: item.serviceId,
          })),
        },
      },
      include: {
        items: true,
        client: true,
      },
    });

    // Krok 2: Pokus o synchronizaci transakce do Pohody jako prodejka
    try {
      this.logger.log(
        `Attempting to sync transaction ${newTransaction.id} to Pohoda.`,
      );
      const pohodaId = await this.pohodaService.createInvoice(newTransaction);

      // Krok 3: Aktualizace transakce v lokální DB s ID z Pohody
      if (pohodaId) {
        return await this.prisma.transaction.update({
          where: { id: newTransaction.id },
          data: { pohodaId: pohodaId },
          include: {
            items: true,
            client: true,
          },
        });
      }
    } catch (error) {
      // Pokud synchronizace selže, zalogujeme chybu, ale transakce zůstane v našem systému.
      this.logger.error(
        `Failed to sync new transaction ${newTransaction.id} to Pohoda. Transaction remains in local DB without pohodaId.`,
        error.stack,
      );
    }

    return newTransaction;
  }

  findAll() {
    return this.prisma.transaction.findMany({
      include: { client: true, items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        client: true,
        items: {
          include: {
            product: true,
          },
        },
        reservation: true,
      },
    });
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }
    return transaction;
  }

  update(id: number, updateTransactionDto: UpdateTransactionDto) {
    // Rozšíření: updateTransactionDto pravděpodobně také obsahuje 'items'
    const { items, ...transactionData } = updateTransactionDto;
    return this.prisma.transaction.update({
      where: { id },
      data: {
        ...transactionData,
        // TODO: Implementovat logiku pro aktualizaci položek (smazání starých a vytvoření nových)
      },
    });
  }

  remove(id: number) {
    // Pozor: Toto smaže transakci jen v lokální DB. V Pohodě zůstane.
    return this.prisma.transaction.delete({ where: { id } });
  }

  // Změna zde: Používáme správný název DTO
  async addItem(transactionId: number, addItemDto: AddTransactionItemDto) {
    // TODO: Přidat logiku pro přepočítání celkové ceny transakce
    return this.prisma.transactionItem.create({
      data: {
        transactionId,
        ...addItemDto,
      },
    });
  }
}

