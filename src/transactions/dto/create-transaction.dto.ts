// src/transactions/dto/create-transaction.dto.ts
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTransactionDto {
  @IsInt()
  @IsNotEmpty()
  reservationId: number;

  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  // Položky se přidají automaticky, ale můžeme je přidávat i ručně
  // To doděláme později
}
