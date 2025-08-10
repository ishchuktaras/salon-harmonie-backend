// src/clients/clients.module.ts
import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { AuthModule } from 'src/auth/auth.module';
import { AbraFlexiModule } from 'src/abra-flexi/abra-flexi.module'; 
@Module({
  imports: [AuthModule, AbraFlexiModule],
  controllers: [ClientsController],
  providers: [ClientsService],
})
export class ClientsModule {}