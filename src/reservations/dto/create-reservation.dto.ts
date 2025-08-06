// src/reservations/dto/create-reservation.dto.ts
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateReservationDto {
  @IsDateString()
  @IsNotEmpty()
  startTime: string; // Očekáváme datum ve formátu ISO 8601, např. "2025-08-06T10:00:00.000Z"

  @IsDateString()
  @IsNotEmpty()
  endTime: string;

  @IsInt()
  @IsNotEmpty()
  therapistId: number;

  @IsInt()
  @IsNotEmpty()
  clientId: number;

  @IsString()
  @IsOptional() 
  notes?: string;
}