import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    // Zde můžeme nastavit, jak se jmenují pole pro jméno a heslo v našem DTO.
    // Výchozí je 'username' a 'password', my používáme 'email'.
    super({ usernameField: 'email' });
  }

  /**
   * Tuto metodu zavolá Passport automaticky, když se použije LocalAuthGuard.
   * Naším úkolem je jen zavolat metodu validateUser, kterou už máme hotovou.
   * @param email - Hodnota z pole 'email' v těle požadavku.
   * @param password - Hodnota z pole 'password' v těle požadavku.
   * @returns Vrací objekt uživatele (bez hesla), pokud je validace úspěšná.
   */
  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      // Pokud validateUser vrátí null, vyhodíme standardní 401 chybu.
      throw new UnauthorizedException('Neplatné přihlašovací údaje.');
    }
    return user;
  }
}
