// Soubor: src/auth/auth.service.ts

import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { Role, User } from '@prisma/client';

// Definice typu pro data, která jdou do JWT tokenu.
type UserForLogin = Pick<User, 'email' | 'id' | 'role' | 'firstName' | 'lastName'>;

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<UserForLogin | null> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      const { passwordHash, createdAt, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: UserForLogin) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: payload,
    };
  }

  async register(createUserDto: CreateUserDto) {
    const newUser = await this.usersService.create(createUserDto);
    return this.login(newUser);
  }
  
  async findOrCreateFromGoogle(googleLoginDto: GoogleLoginDto) {
    const { email, firstName, lastName } = googleLoginDto;
    
    let user = await this.usersService.findOneByEmail(email);

    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-8);
      
      user = await this.usersService.create({
        email,
        firstName,
        lastName,
        password: randomPassword,
        role: Role.KLIENT,
      });
    }
    
    // Plný objekt 'user' je kompatibilní s typem 'UserForLogin', 
    // TypeScript si vezme jen potřebné vlastnosti.
    return this.login(user);
  }
}