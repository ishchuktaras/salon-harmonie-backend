import { PartialType } from '@nestjs/mapped-types';
import { CreateWorkScheduleDto } from './create-schedule.dto'; 

export class UpdateScheduleDto extends PartialType(CreateWorkScheduleDto) {}