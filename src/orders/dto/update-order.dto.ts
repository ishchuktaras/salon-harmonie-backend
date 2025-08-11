// src/orders/dto/update-order.dto.ts
import { IsEnum, IsString } from 'class-validator';

// Pro přehlednost si můžeme vytvořit vlastní enum pro stavy
export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  SHIPPED = 'SHIPPED',
  CANCELED = 'CANCELED',
}

export class UpdateOrderDto {
  @IsString()
  @IsEnum(OrderStatus)
  status: OrderStatus;
}