// src/auth/dto/google-login.dto.ts
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class GoogleLoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;
}