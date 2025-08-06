// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  Get,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from 'src/auth/public.decorator'; // <-- Přidejte tento import

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() body) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Neplatný e-mail nebo heslo.');
    }
    return this.authService.login(user);
  }

  @Get('profile') // Tento endpoint zůstává chráněný, protože nemá @Public()
  getProfile(@Request() req) {
    return req.user;
  }
}