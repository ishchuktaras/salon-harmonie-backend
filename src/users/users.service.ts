// Soubor: src/users/users.service.ts

import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { email, password, firstName, lastName, role } = createUserDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Uživatel s tímto e-mailem již existuje');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // --- OPRAVA ZDE ---
    // Explicitně převedeme příchozí hodnotu (která může být string) na typ Role.
    // Pokud role v DTO není poskytnuta, použijeme výchozí hodnotu Role.KLIENT.
    // Validátor @IsEnum v DTO již zajistil, že pokud role přijde, je to platný klíč.
    const userRole = role ? (role as Role) : Role.KLIENT;

    return this.prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        role: userRole, // Použijeme opravenou a správně typovanou hodnotu
      },
    });
  }

  async findOneByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }
}