// src/services/services.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { Public } from '../auth/public.decorator';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Public()
  @Get()
  findAll() {
    return this.servicesService.findAll();
  }

  @Public()
  @Get(':id/therapists')
  findTherapistsForService(@Param('id') id: string) {
    return this.servicesService.findTherapistsForService(+id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.MANAGER, Role.ADMIN)
  @Post()
  create(@Body() createServiceDto: CreateServiceDto) {
    return this.servicesService.create(createServiceDto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.MANAGER, Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return this.servicesService.update(+id, updateServiceDto);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.MANAGER, Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.servicesService.remove(+id);
  }
}
