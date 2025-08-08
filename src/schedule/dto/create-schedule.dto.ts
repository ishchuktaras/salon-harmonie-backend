// src/schedule/dto/create-schedule.dto.ts
import { IsInt, IsNotEmpty, IsString, Matches, Max, Min } from 'class-validator';

export class CreateWorkScheduleDto {
  @IsInt()
  @Min(0)
  @Max(6)
  @IsNotEmpty()
  dayOfWeek: number;

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/) // Ověřuje formát HH:mm
  @IsNotEmpty()
  startTime: string;

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  @IsNotEmpty()
  endTime: string;
}