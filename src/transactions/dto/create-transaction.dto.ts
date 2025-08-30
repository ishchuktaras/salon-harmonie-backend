import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
// Změna zde: Importujeme správný název třídy
import { AddTransactionItemDto } from './add-item.dto';

export class CreateTransactionDto {
  @IsInt()
  @IsNotEmpty()
  total: number;

  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @IsInt()
  @IsNotEmpty()
  clientId: number;

  @IsInt()
  @IsOptional()
  reservationId?: number;

  @IsArray()
  @ValidateNested({ each: true })
  // Změna zde: Používáme správný název třídy
  @Type(() => AddTransactionItemDto)
  items: AddTransactionItemDto[];
}

