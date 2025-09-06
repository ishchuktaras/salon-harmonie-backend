// src/transactions/transactions.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Res,
} from '@nestjs/common';
import type { Response } from 'express'; // <-- TOTO JE KLÍČOVÁ OPRAVA
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { AddTransactionItemDto } from './dto/add-item.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  findAll() {
    return this.transactionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(+id);
  }

  @Roles(Role.RECEPCNI, Role.MANAGER, Role.ADMIN)
  @Post(':id/items')
  addItem(
    @Param('id') id: string,
    @Body() addTransactionItemDto: AddTransactionItemDto,
  ) {
    return this.transactionsService.addItem(+id, addTransactionItemDto);
  }

  @Roles(Role.MANAGER, Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transactionsService.remove(+id);
  }
}
