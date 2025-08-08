// src/transactions/transactions.controller.ts
import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/users/enums/role.enum';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Roles(Role.RECEPCNI, Role.MANAGER, Role.ADMIN)
  @Post()
  create(@Body() createTransactionDto: CreateTransactionDto) {
    // TOTO JE OPRAVA: Přejmenovali jsme metodu, aby odpovídala službě
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
  
  @Roles(Role.MANAGER, Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transactionsService.remove(+id);
  }
}
