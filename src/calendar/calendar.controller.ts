// src/calendar/calendar.controller.ts

import {
  Controller,
  Get,
  Query,
  UseGuards,
  Post,
  Body,
} from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client'; 

@Controller('calendar')
@UseGuards(JwtAuthGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get('availability')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN, Role.RECEPCNI, Role.TERAPEUT)
  getAvailability(
    @Query('therapistId') therapistId: string,
    @Query('date') date: string,
  ) {
    return this.calendarService.getTherapistAvailabilityForDate(
      +therapistId,
      new Date(date),
    );
  }
}