// src/prisma/prisma.module.ts

import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Toto je důležité! Zpřístupní službu globálně.
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // A toto umožní ostatním modulům ji používat.
})
export class PrismaModule {}