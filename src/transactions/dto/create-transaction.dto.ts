import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
// Opravený import, aby odpovídal Kroku 1
import { CreateTransactionItemDto } from './create-transaction-item.dto';

export class CreateTransactionDto {
  @IsInt()
  @IsNotEmpty()
  clientId: number;

  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTransactionItemDto)
  items: CreateTransactionItemDto[];
}