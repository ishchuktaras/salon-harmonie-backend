import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/enums/role.enum';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // Původní endpoint pro denní uzávěrku
  @Post('daily-closeout')
  @Roles(Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN)
  performDailyCloseout(@Body('date') date: string) {
    return this.reportsService.performDailyCloseout(date);
  }
  
  // Náš vylepšený endpoint pro dashboard
  @Get('dashboard-summary')
  @Roles(Role.MANAGER, Role.ADMIN, Role.SUPER_ADMIN)
  getDashboardSummary() {
    return this.reportsService.getDashboardSummary();
  }
}

