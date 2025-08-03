// src/users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

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

    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        role: createUserDto.role,
        passwordHash: hashedPassword,
      },
    });

    // Odstraníme hash hesla z objektu, který vracíme
    const { passwordHash, ...result } = user;
    return result;
  }

  /**
   * Vrátí všechny uživatele bez jejich hesel.
   */
  async findAll() {
    const users = await this.prisma.user.findMany();
    // Projdeme všechny uživatele a odstraníme z nich hesla
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
    // Zde by v budoucnu mohla být i logika pro změnu hesla
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
}