import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';
import { Request } from 'express';

// --- FUNKCE PRO EXTRAKCI TOKENU Z COOKIE ---
const cookieExtractor = (req: Request): string | null => {
  if (req && req.cookies) {
    return req.cookies['token']; // Název cookie musí odpovídat tomu, co nastavuje frontend
  }
  return null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET není definován v .env souboru!');
    }

    super({
      jwtFromRequest: cookieExtractor,
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    // Z bezpečnostních důvodů nevracíme hash hesla
    const { passwordHash, ...result } = user;
    return result;
  }
}
