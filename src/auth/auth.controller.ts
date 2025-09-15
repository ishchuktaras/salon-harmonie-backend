import { Controller, Post, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Toto je náš nový, vylepšený login endpoint.
   * Je to jediný endpoint, který bude používat LocalAuthGuard.
   */
  @Public() // Označíme ho jako veřejný, aby prošel přes globální JwtAuthGuard
  @UseGuards(LocalAuthGuard) // Tento Guard spustí naši LocalStrategy
  @Post('login')
  async login(@Request() req: any) {
    // Pokud se kód dostane sem, znamená to, že LocalStrategy úspěšně
    // validovala uživatele. Validovaný objekt uživatele je nyní v `req.user`.
    // Teď už jen zavoláme službu, aby vygenerovala JWT token.
    return this.authService.login(req.user);
  }

  // Zde může být v budoucnu např. endpoint /profile, který bude chráněný
}
