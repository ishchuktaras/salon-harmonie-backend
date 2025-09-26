// src/auth/auth.controller.ts

import { Controller, Post, UseGuards, Request, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { Public } from './public.decorator';
import { CreateUserDto } from '../users/dto/create-user.dto'; 
import { GoogleLoginDto } from './dto/google-login.dto'; 

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Původní endpoint pro přihlášení jménem a heslem - zůstává
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: any) {
    return this.authService.login(req.user);
  }

  // --- NOVINKA: Endpoint pro registraci klienta ---
  @Public()
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    // Zavoláme novou metodu v AuthService, která se postará o vytvoření uživatele a přihlášení
    return this.authService.register(createUserDto);
  }
  
  // --- NOVINKA: Endpoint pro zpracování Google přihlášení ---
  @Public()
  @Post('google-login')
  async googleLogin(@Body() googleLoginDto: GoogleLoginDto) {
    // Nová metoda, která najde nebo vytvoří uživatele na základě Google profilu
    return this.authService.findOrCreateFromGoogle(googleLoginDto);
  }
}