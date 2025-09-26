import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { email, password, firstName, lastName, role } = createUserDto;
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Uživatel s tímto e-mailem již existuje');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const userRole = role ? (role as Role) : Role.KLIENT;

    return this.prisma.user.create({
      data: { email, passwordHash, firstName, lastName, role: userRole },
    });
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Uživatel s ID ${id} nebyl nalezen`);
    }
    return user;
  }
  
  async findOneByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const { password, ...dataToUpdate } = updateUserDto;
    const updateData: any = { ...dataToUpdate };
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }
    return this.prisma.user.update({ where: { id }, data: updateData });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.user.delete({ where: { id } });
  }

  async assignService(userId: number, serviceId: number) {
    // Ověříme, že uživatel i služba existují
    await this.findOne(userId);
    const service = await this.prisma.service.findUnique({ where: { id: serviceId }});
    if (!service) {
      throw new NotFoundException(`Služba s ID ${serviceId} nebyla nalezena`);
    }

    
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        services: {
          connect: { id: serviceId },
        },
      },
    });
  }
}