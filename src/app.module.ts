// src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule } from './clients/clients.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './auth/roles.guard';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { ServicesModule } from './services/services.module';
import { ReservationsModule } from './reservations/reservations.module';
import { CalendarModule } from './calendar/calendar.module';
import { ScheduleModule } from './schedule/schedule.module';
import { TransactionsModule } from './transactions/transactions.module';
import { ProductsModule } from './products/products.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    AuthModule,
    ClientsModule,
    ReservationsModule,
    ServicesModule,
    CalendarModule,
    ScheduleModule,
    TransactionsModule,
    ProductsModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // 1. Nejdříve se spustí kontrola tokenu
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard, // 2. Až potom se spustí kontrola rolí
    },
  ],
})
export class AppModule {}
