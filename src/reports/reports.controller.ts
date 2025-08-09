// src/reports/reports.controller.ts
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/users/enums/role.enum';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Roles(Role.MANAGER, Role.ADMIN) // Pouze manažer nebo admin
  @Post('daily-closeout')
  performDailyCloseout(@Body('date') date: string) {
    // Očekáváme datum ve formátu "YYYY-MM-DD"
    return this.reportsService.performDailyCloseout(date);
  }
}