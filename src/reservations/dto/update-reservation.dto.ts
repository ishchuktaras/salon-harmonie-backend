// src/reservations/dto/update-reservation.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateReservationDto } from './create-reservation.dto';
import { IsDateString, IsOptional, IsString } from 'class-validator';

// PartialType automaticky vezme všechna pravidla z CreateReservationDto
// a označí je jako nepovinná. My si přidáme jen ta, která chceme měnit.
export class UpdateReservationDto extends PartialType(CreateReservationDto) {
  @IsDateString()
  @IsOptional()
  startTime?: string;

  @IsDateString()
  @IsOptional()
  endTime?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
