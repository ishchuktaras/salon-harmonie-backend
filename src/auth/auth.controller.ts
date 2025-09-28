import { Controller, Post, UseGuards, Request, Body, Get } from '@nestjs/common'; // <-- Přidán import Get
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { Public } from './public.decorator';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { JwtAuthGuard } from './jwt-auth.guard'; 

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: any) {
    return this.authService.login(req.user);
  }

  @Public()
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }
  
  @Public()
  @Post('google-login')
  async googleLogin(@Body() googleLoginDto: GoogleLoginDto) {
    return this.authService.findOrCreateFromGoogle(googleLoginDto);
  }

  
  @UseGuards(JwtAuthGuard) // Tento "Guard" zajistí, že endpoint je chráněný
  @Get('profile')
  getProfile(@Request() req) {
    // JwtAuthGuard po úspěšném ověření tokenu přidá data uživatele do `req.user`.
   
    return req.user;
  }
}