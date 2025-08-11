// src/reservations/reservations.module.ts
import { Module } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { MailModule } from 'src/mail/mail.module'; 

@Module({
  imports: [MailModule],
  controllers: [ReservationsController],
  providers: [ReservationsService],
})
export class ReservationsModule {}