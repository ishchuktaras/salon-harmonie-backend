// src/abra-flexi/abra-flexi.module.ts
import { Module } from '@nestjs/common';
import { AbraFlexiService } from './abra-flexi.service';

@Module({
  providers: [AbraFlexiService],
  exports: [AbraFlexiService], // <-- Důležité, aby ji mohly používat jiné moduly
})
export class AbraFlexiModule {}