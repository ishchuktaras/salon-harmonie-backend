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
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/users/enums/role.enum';
import { AddTransactionItemDto } from './dto/add-item.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Roles(Role.RECEPCNI, Role.MANAGER, Role.ADMIN)
  @Post()
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.createFromReservation(createTransactionDto);
  }

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

  @Get(':id/receipt')
  async getReceipt(@Param('id') id: string, @Res() res: Response) {
    const html = await this.transactionsService.generateReceiptHtml(+id);
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }
}