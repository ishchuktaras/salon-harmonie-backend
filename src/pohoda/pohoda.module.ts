import { Module } from '@nestjs/common';
import { PohodaService } from './pohoda.service';
import { HttpModule } from '@nestjs/axios';
// OPRAVA: Odstranili jsme import ConfigModule, protože je globální
// import { ConfigModule } from '@nestjs/config';

@Module({
  // OPRAVA: Odstranili jsme ConfigModule z imports.
  // PohodaService si díky globalitě najde ConfigService sama.
  imports: [HttpModule],
  providers: [PohodaService],
  exports: [PohodaService],
})
export class PohodaModule {}


