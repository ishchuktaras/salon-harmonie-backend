import { IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateTransactionItemDto {
  @IsInt()
  @IsNotEmpty()
  quantity: number;

  @IsInt()
  @IsOptional()
  productId?: number;

  @IsInt()
  @IsOptional()
  serviceId?: number;
}