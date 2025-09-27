import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AddTransactionItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @IsNotEmpty()
  price: number;

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

