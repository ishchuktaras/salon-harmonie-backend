// src/calendar/calendar.controller.ts
import { Controller, Get, Param, Query } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { Public } from 'src/auth/public.decorator';

@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Public()
  @Get('availability')
  getAvailability(
    @Query('therapistId') therapistId: string,
    @Query('serviceId') serviceId: string,
    @Query('date') date: string, // např. "2025-08-20"
  ) {
    return this.calendarService.getAvailability(+therapistId, +serviceId, date);
  }
}