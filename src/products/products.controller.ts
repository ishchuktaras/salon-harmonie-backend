// src/products/products.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/users/enums/role.enum';
import { Public } from 'src/auth/public.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // Vytvářet, upravovat a mazat může jen personál s vyšším oprávněním
  @Roles(Role.MANAGER, Role.ADMIN, Role.ESHOP_SPRAVCE)
  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Public() // Seznam produktů může vidět kdokoliv
  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Roles(Role.MANAGER, Role.ADMIN, Role.ESHOP_SPRAVCE)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  @Roles(Role.MANAGER, Role.ADMIN, Role.ESHOP_SPRAVCE)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}
