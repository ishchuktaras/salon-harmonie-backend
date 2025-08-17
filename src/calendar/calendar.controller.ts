// src/calendar/calendar.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { Public } from 'src/auth/public.decorator';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/users/enums/role.enum';

@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Public()
  @Get('availability')
  getAvailability(
    @Query('therapistId') therapistId: string,
    @Query('serviceId') serviceId: string,
    @Query('date') date: string,
  ) {
    return this.calendarService.getAvailability(+therapistId, +serviceId, date);
  }

  // --- ENDPOINT PRO ZOBRAZENÍ KALENDÁŘE PRO MANAGERY ---
  @Roles(Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN)
  @Get('manager-view')
  getManagerView(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.calendarService.getManagerView(startDate, endDate);
  }
}