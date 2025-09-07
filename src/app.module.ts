import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // Ujistěte se, že import je zde
import { APP_GUARD } from '@nestjs/core';
import { HttpModule } from '@nestjs/axios';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ClientsModule } from './clients/clients.module';
import { ReservationsModule } from './reservations/reservations.module';
import { ServicesModule } from './services/services.module';
import { CalendarModule } from './calendar/calendar.module';
import { ScheduleModule } from './schedule/schedule.module';
import { TransactionsModule } from './transactions/transactions.module';
import { ProductsModule } from './products/products.module';
import { ReportsModule } from './reports/reports.module';
import { OrdersModule } from './orders/orders.module';
import { PrismaModule } from './prisma/prisma.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';
import { PohodaModule } from './pohoda/pohoda.module';

@Module({
  imports: [
    // --- OPRAVA ZDE: ConfigModule musí být úplně první ---
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    // ----------------------------------------------------
    PohodaModule,
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
    OrdersModule,
    PrismaModule,
    HttpModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}