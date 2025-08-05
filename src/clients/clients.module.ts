// src/clients/clients.module.ts
import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule], 
  controllers: [ClientsController],
  providers: [ClientsService],
})
export class ClientsModule {}