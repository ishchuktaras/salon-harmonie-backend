import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
   
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      // TOTO JE TA KLÍČOVÁ OPRAVA:
      // Říkáme ConfigModule, aby se podíval na standardní cestu,
      // kam Render umisťuje Secret Files v Dockeru.
      envFilePath: '/etc/secrets/.env',
    }),
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

    

