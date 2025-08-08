// src/schedule/schedule.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateWorkScheduleDto } from './dto/create-schedule.dto';
import { CreateTimeBlockDto } from './dto/create-time-block.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  // --- Endpoints pro Pracovní Dobu ---
  @Post('work')
  createWorkSchedule(@Body() dto: CreateWorkScheduleDto, @Request() req) {
    const therapistId = req.user.id;
    return this.scheduleService.createWorkSchedule(dto, therapistId);
  }

  @Get('work')
  getWorkSchedule(@Request() req) {
    const therapistId = req.user.id;
    return this.scheduleService.getWorkScheduleForUser(therapistId);
  }

  @Delete('work/:id')
  deleteWorkSchedule(@Param('id') id: string) {
    return this.scheduleService.deleteWorkSchedule(+id);
  }

  // --- Endpoints pro Časové Blokace ---
  @Post('block')
  createTimeBlock(@Body() dto: CreateTimeBlockDto, @Request() req) {
    const therapistId = req.user.id;
    return this.scheduleService.createTimeBlock(dto, therapistId);
  }

  @Get('block')
  getTimeBlocks(@Request() req) {
    const therapistId = req.user.id;
    return this.scheduleService.getTimeBlocksForUser(therapistId);
  }

  @Delete('block/:id')
  deleteTimeBlock(@Param('id') id: string) {
    return this.scheduleService.deleteTimeBlock(+id);
  }
}
