// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  Get, // <-- Ujistěte se, že je Get naimportovaný
  UnauthorizedException, // <-- Přidáme pro lepší chybovou hlášku
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      // Vylepšená chybová hláška
      throw new UnauthorizedException('Neplatný e-mail nebo heslo.');
    }
    return this.authService.login(user);
  }

  
  @UseGuards(AuthGuard('jwt')) // Nasadíme "strážníka", který vyžaduje platný token
  @Get('profile') // Tento endpoint bude poslouchat na adrese GET /auth/profile
  getProfile(@Request() req) {
    // Díky našemu "strážníkovi" (JwtStrategy) máme v req.user data z tokenu
    return req.user;
  }
}
