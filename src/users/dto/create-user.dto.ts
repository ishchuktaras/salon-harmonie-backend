// src/users/dto/create-user.dto.ts
import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Role } from '../enums/role.enum';

export class CreateUserDto {
  @IsEmail({}, { message: 'Prosím, zadejte platný e-mail.' })
  @IsNotEmpty({ message: 'E-mail nesmí být prázdný.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Křestní jméno nesmí být prázdné.' })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'Příjmení nesmí být prázdné.' })
  lastName: string;

  @IsString()
  @IsNotEmpty({ message: 'Heslo nesmí být prázdné.' })
  @MinLength(8, { message: 'Heslo musí mít alespoň 8 znaků.' })
  password: string;

  @IsEnum(Role, { message: 'Role musí být jedna z platných hodnot.' })
  @IsNotEmpty({ message: 'Role nesmí být prázdná.' })
  role: Role;
}