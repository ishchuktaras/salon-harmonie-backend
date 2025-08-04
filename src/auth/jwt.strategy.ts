// src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    // Nejdříve načteme klíč do proměnné
    const secret = configService.get<string>('JWT_SECRET');

    // Zkontrolujeme, jestli klíč existuje. Pokud ne, aplikace se nespustí.
    // To je správné chování - chceme vědět hned, že nám chybí konfigurace.
    if (!secret) {
      throw new Error('Chybí tajný klíč JWT_SECRET v .env souboru!');
    }

    // Až teď, když víme, že klíč existuje, voláme super()
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret, // Nyní předáváme zaručeně existující string
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
