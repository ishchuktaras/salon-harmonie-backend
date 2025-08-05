// src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service'; // <-- Přidáme import UsersService

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService, 
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('Chybí tajný klíč JWT_SECRET v .env souboru!');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  // Tato metoda se zavolá, když je token platný.
  // 'payload' jsou dekódovaná data z tokenu.
  async validate(payload: { sub: number; email: string }) {
    // Použijeme ID z tokenu (payload.sub) k načtení celého uživatele z databáze.
    const user = await this.usersService.findOne(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Uživatel nenalezen.');
    }

    // Vrátíme celý objekt uživatele (bez hesla, to už řeší UsersService).
    // Passport ho automaticky připojí k požadavku jako `req.user`.
    return user;
  }
}