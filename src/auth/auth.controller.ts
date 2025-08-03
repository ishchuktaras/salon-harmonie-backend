// src/auth/auth.controller.ts
import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Tento endpoint bude na adrese POST /auth/login
  @Post('login')
  async login(@Body() body) {
    // Tady bude validace, kterou doděláme v dalším kroku
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      // V reálné aplikaci by zde měla být lepší chybová hláška
      throw new Error('Invalid credentials');
    }
    return this.authService.login(user);
  }
}