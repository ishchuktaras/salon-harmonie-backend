// src/prisma/prisma.service.ts

import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  // Tato metoda se automaticky zavolá, když se aplikace spustí.
  async onModuleInit() {
    // Tímto se připojíme k databázi.
    await this.$connect();
  }
}