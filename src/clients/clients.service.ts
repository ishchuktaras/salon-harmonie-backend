import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PrismaService } from '../prisma/prisma.service';
import { PohodaService } from '../pohoda/pohoda.service';

@Injectable()
export class ClientsService {
  private readonly logger = new Logger(ClientsService.name);

  constructor(
    private prisma: PrismaService,
    private pohodaService: PohodaService,
  ) {}

  async create(createClientDto: CreateClientDto) {
    // Krok 1: Vytvoření klienta v lokální databázi
    const newClient = await this.prisma.client.create({
      data: createClientDto,
    });

    // Krok 2: Pokus o synchronizaci klienta do Pohody
    try {
      this.logger.log(`Attempting to sync client ${newClient.id} to Pohoda.`);
      const pohodaId = await this.pohodaService.createAddressbookEntry(newClient);

      // Krok 3: Aktualizace klienta v lokální DB s ID z Pohody
      if (pohodaId) {
        return await this.prisma.client.update({
          where: { id: newClient.id },
          data: { pohodaId: pohodaId },
        });
      }
    } catch (error) {
      // Pokud synchronizace selže, zalogujeme chybu, ale necháme klienta existovat v našem systému.
      // Selhání synchronizace by nemělo bránit vytvoření klienta v rezervačním systému.
      this.logger.error(
        `Failed to sync new client ${newClient.id} to Pohoda. Client remains in local DB without pohodaId.`,
        error.stack,
      );
    }

    return newClient;
  }

  findAll() {
    return this.prisma.client.findMany({
      orderBy: {
        lastName: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const client = await this.prisma.client.findUnique({
      where: { id },
      include: {
        reservations: {
          include: {
            service: true,
            therapist: true,
          },
          orderBy: {
            startTime: 'desc',
          },
        },
        transactions: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
    return client;
  }

  update(id: number, updateClientDto: UpdateClientDto) {
    // TODO: Přidat logiku pro aktualizaci záznamu v Pohodě, pokud se změní relevantní údaje.
    return this.prisma.client.update({
      where: { id },
      data: updateClientDto,
    });
  }

  remove(id: number) {
    // TODO: Přidat logiku pro případnou deaktivaci/smazání záznamu v Pohodě.
    return this.prisma.client.delete({ where: { id } });
  }
}
