import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';
import { Request } from 'express';

// Funkce pro extrakci tokenu z cookie
const cookieExtractor = (req: Request): string | null => {
  if (req && req.cookies) {
    return req.cookies['token']; // Název cookie
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
      // Říkáme strategii, aby použila naši funkci pro čtení z cookie
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
    const { passwordHash, ...result } = user;
    return result;
  }
}