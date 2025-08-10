// src/reports/reports.module.ts
import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { AbraFlexiModule } from 'src/abra-flexi/abra-flexi.module';

@Module({
  imports: [AbraFlexiModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}