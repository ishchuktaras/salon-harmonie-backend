// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: 'VAS_SUPER_TAJNY_KLIC', // DŮLEŽITÉ: V reálné aplikaci toto uložte bezpečně!
      signOptions: { expiresIn: '60m' }, // Token vyprší za 60 minut
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService], // Později sem přidáme strategie
})
export class AuthModule {}
