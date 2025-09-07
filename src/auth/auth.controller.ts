import {
  Controller,
  Post,
  Body,
  Request,
  Get,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';
import { LoginDto } from './dto/login.dto'; 

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Neplatný e-mail nebo heslo.');
    }
    return this.authService.login(user);
  }

  // Tento endpoint zůstává chráněný globálním guardem, protože nemá @Public()
  @Get('profile')
  getProfile(@Request() req) {
    // req.user je sem vložen po úspěšné validaci tokenu v JwtStrategy
    return req.user;
  }
}