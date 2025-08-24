// src/users/users.service.ts
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Vytvoří nového uživatele a zahashuje jeho heslo.
   */
  async create(createUserDto: CreateUserDto) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      saltRounds,
    );

    try {
      const user = await this.prisma.user.create({
        data: {
          email: createUserDto.email,
          firstName: createUserDto.firstName,
          lastName: createUserDto.lastName,
          role: createUserDto.role,
          passwordHash: hashedPassword,
        },
      });

      const { passwordHash, ...result } = user;
      return result;
    } catch (error) {
      // Zkontrolujeme, jestli se jedná o chybu duplicitního záznamu (kód P2002)
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        // Pokud ano, vrátíme hezkou chybu 409 Conflict
        throw new ConflictException('Uživatel s tímto e-mailem již existuje.');
      }
      // Pokud je to jiná chyba, necháme ji projít dál
      throw error;
    }
  }

  /**
   * Vrátí všechny uživatele bez jejich hesel.
   */
  async findAll() {
    const users = await this.prisma.user.findMany();
    return users.map((user) => {
      const { passwordHash, ...result } = user;
      return result;
    });
  }

  /**
   * Najde jednoho uživatele podle ID, bez hesla.
   */
  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    const { passwordHash, ...result } = user;
    return result;
  }

  /**
   * Najde jednoho uživatele podle e-mailu, VČETNĚ hesla (pro účely přihlášení).
   */
  async findOneByEmail(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  /**
   * Upraví data uživatele.
   */
  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
    const { passwordHash, ...result } = user;
    return result;
  }

  /**
   * Smaže uživatele.
   */
  async remove(id: number) {
    const user = await this.prisma.user.delete({ where: { id } });
    const { passwordHash, ...result } = user;
    return result;
  }

  assignService(userId: number, serviceId: number) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        services: {
          connect: { id: serviceId }, // Propojíme existující službu
        },
      },
    });
  }
}
