// src/auth/auth.service.ts

import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt'; 

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    // SPUSTÍME STOPKY
    console.time('Login Validation'); 

    console.log(`--- Pokus o validaci uživatele: ${email} ---`);
    
    console.timeLog('Login Validation', 'Hledám uživatele v DB...');
    const user = await this.usersService.findOneByEmail(email);
    console.timeLog('Login Validation', 'Uživatel nalezen.');

    if (user) {
      console.timeLog('Login Validation', 'Porovnávám heslo pomocí bcrypt...');
      const isPasswordMatching = await bcrypt.compare(pass, user.passwordHash);
      console.timeLog('Login Validation', 'Porovnání hesla dokončeno.');

      if (isPasswordMatching) {
        // ZASTAVÍME STOPKY A VYPÍŠEME VÝSLEDEK
        console.timeEnd('Login Validation');
        const { passwordHash, ...result } = user;
        return result;
      }
    }
    
    console.timeEnd('Login Validation');
    return null;
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: payload, // Přidáme informace o uživateli do odpovědi
    };
  }
}
