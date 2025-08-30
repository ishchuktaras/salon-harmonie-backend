import { Module } from '@nestjs/common';
import { PohodaService } from './pohoda.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
  ],
  providers: [PohodaService],
  exports: [PohodaService],
})
export class PohodaModule {}
