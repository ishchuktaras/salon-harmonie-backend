// src/clients/clients.service.ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { AbraFlexiService } from 'src/abra-flexi/abra-flexi.service'; // <-- Přidali jsme import

@Injectable()
export class ClientsService {
  // Upravili jsme konstruktor, aby si "vstříknul" novou službu
  constructor(
    private prisma: PrismaService,
    private abraFlexiService: AbraFlexiService,
  ) {}

  async create(createClientDto: CreateClientDto) {
    try {
      const newClient = await this.prisma.client.create({
        data: createClientDto,
      });

      // TOTO JE NOVÁ ČÁST: Zavoláme naši novou funkci pro synchronizaci
      await this.abraFlexiService.createClientInAbraFlexi(newClient);

      return newClient;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Klient s tímto e-mailem již existuje.');
      }
      throw error;
    }
  }

  findAll() {
    return this.prisma.client.findMany();
  }

  async findOne(id: number) {
    const client = await this.prisma.client.findUnique({ where: { id } });
    if (!client) {
      throw new NotFoundException(`Klient s ID ${id} nebyl nalezen.`);
    }
    return client;
  }

  update(id: number, updateClientDto: UpdateClientDto) {
    return this.prisma.client.update({
      where: { id },
      data: updateClientDto,
    });
  }

  remove(id: number) {
    return this.prisma.client.delete({ where: { id } });
  }
}
