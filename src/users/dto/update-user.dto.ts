import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Role } from '@prisma/client'; // <-- Také zde opravíme import

export class UpdateUserDto {
  @IsEmail({}, { message: 'Prosím, zadejte platný e-mail.' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @MinLength(8, { message: 'Heslo musí mít alespoň 8 znaků.' })
  @IsOptional()
  password?: string; // <-- Heslo je zde jako volitelná vlastnost

  @IsEnum(Role, { message: 'Role musí být jedna z platných hodnot.' })
  @IsOptional()
  role?: Role;
}