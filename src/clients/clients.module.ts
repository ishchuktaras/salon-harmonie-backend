// src/clients/clients.module.ts
import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { AuthModule } from 'src/auth/auth.module';
import { PohodaModule } from '../pohoda/pohoda.module';

@Module({
  imports: [AuthModule, PohodaModule],
  controllers: [ClientsController],
  providers: [ClientsService],
})
export class ClientsModule {}