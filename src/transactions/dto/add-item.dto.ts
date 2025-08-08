// src/transactions/dto/add-item.dto.ts
import { IsInt, IsNotEmpty } from 'class-validator';

export class AddTransactionItemDto {
  @IsInt()
  @IsNotEmpty()
  productId: number;

  @IsInt()
  @IsNotEmpty()
  quantity: number;
}