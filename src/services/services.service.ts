// src/services/services.service.ts
import { Injectable } from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  create(createServiceDto: CreateServiceDto) {
    return this.prisma.service.create({ data: createServiceDto });
  }

  findAll() {
    return this.prisma.service.findMany();
  }

  findOne(id: number) {
    return this.prisma.service.findUnique({ where: { id } });
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
      therapists: true, // Načteme všechny propojené terapeuty
    },
  });

  if (!service) {
    return null;
  }

  // Odstraníme hesla z odpovědi
  const therapistsWithoutPassword = service.therapists.map((therapist) => {
    const { passwordHash, ...result } = therapist;
    return result;
  });

  return therapistsWithoutPassword;
}
}
