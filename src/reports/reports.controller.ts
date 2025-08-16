// src/reports/reports.controller.ts

import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/users/enums/role.enum';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Roles(Role.MANAGER, Role.ADMIN)
  @Post('daily-closeout')
  performDailyCloseout(@Body('date') date: string) {
    return this.reportsService.performDailyCloseout(date);
  }

  // --- NÁŠ NOVÝ ENDPOINT PRO DASHBOARD ---
  @Get('dashboard-summary')
  getDashboardSummary() {
    return this.reportsService.getDashboardSummary();
  }
}