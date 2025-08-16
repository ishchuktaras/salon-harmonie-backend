// backend/src/auth/auth.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    this.logger.log(`--- Pokus o validaci uživatele: ${email} ---`);
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      this.logger.warn(`Uživatel s emailem "${email}" NENALEZEN v databázi.`);
      return null;
    }

    const isPasswordMatching = await bcrypt.compare(pass, user.passwordHash);

    if (isPasswordMatching) {
      this.logger.log('✅ HESLA SE SHODUJÍ! Validace úspěšná.');
      const { passwordHash, ...result } = user;
      return result;
    } else {
      this.logger.error('❌ HESLA SE NESHODUJÍ! Validace selhala.');
      return null;
    }
  }

  
  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };
    
    // Nyní vracíme objekt přesně v tom formátu, který frontend očekává
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }
}