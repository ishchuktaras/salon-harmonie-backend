import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Prosím, zadejte platný e-mail.' })
  @IsNotEmpty({ message: 'E-mail nesmí být prázdný.' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Heslo nesmí být prázdné.' })
  password: string;
}