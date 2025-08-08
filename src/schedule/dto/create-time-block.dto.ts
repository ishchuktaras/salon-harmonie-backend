// src/schedule/dto/create-time-block.dto.ts
import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTimeBlockDto {
  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @IsDateString()
  @IsNotEmpty()
  endTime: string;

  @IsString()
  @IsOptional()
  reason?: string;
}