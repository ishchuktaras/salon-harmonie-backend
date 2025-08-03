// src/clients/clients.service.ts
import { Injectable } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ClientsService {
  // Tímto si "vstříkneme" náš nástroj pro práci s databází
  constructor(private prisma: PrismaService) {}

  // Vytvoří nového klienta
  create(createClientDto: CreateClientDto) {
    return this.prisma.client.create({
      data: createClientDto,
    });
  }

  // Najde všechny klienty
  findAll() {
    return this.prisma.client.findMany();
  }

  // Najde jednoho klienta podle jeho ID
  findOne(id: number) {
    return this.prisma.client.findUnique({
      where: { id },
    });
  }

  // Upraví klienta podle jeho ID
  update(id: number, updateClientDto: UpdateClientDto) {
    return this.prisma.client.update({
      where: { id },
      data: updateClientDto,
    });
  }

  // Smaže klienta podle jeho ID
  remove(id: number) {
    return this.prisma.client.delete({
      where: { id },
    });
  }
}