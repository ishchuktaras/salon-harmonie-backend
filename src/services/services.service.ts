// src/services/services.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async create(createServiceDto: CreateServiceDto) {
    try {
      return await this.prisma.service.create({ data: createServiceDto });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new NotFoundException(
          `Služba s názvem '${createServiceDto.name}' již existuje.`,
        );
      }
      throw error;
    }
  }

  findAll() {
    return this.prisma.service.findMany();
  }

  async findOne(id: number) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) {
      throw new NotFoundException(`Služba s ID ${id} nebyla nalezena.`);
    }
    return service;
  }

  update(id: number, updateServiceDto: UpdateServiceDto) {
    return this.prisma.service.update({
      where: { id },
      data: updateServiceDto,
    });
  }

  remove(id: number) {
    return this.prisma.service.delete({ where: { id } });
  }

  
  async findTherapistsForService(id: number) {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: {
        therapists: true,
      },
    });

    if (!service) {
      throw new NotFoundException(`Služba s ID ${id} nebyla nalezena.`);
    }

    // Odstraníme hesla z odpovědi
    const therapistsWithoutPassword = service.therapists.map((therapist) => {
      const { passwordHash, ...result } = therapist;
      return result;
    });

    return therapistsWithoutPassword;
  }
}