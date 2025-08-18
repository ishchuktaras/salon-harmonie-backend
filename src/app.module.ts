// backend/src/app.module.ts

import { Module } from "@nestjs/common"
import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import { UsersModule } from "./users/users.module"
import { AuthModule } from "./auth/auth.module"
import { ClientsModule } from "./clients/clients.module"
import { ReservationsModule } from "./reservations/reservations.module"
import { ServicesModule } from "./services/services.module"
import { CalendarModule } from "./calendar/calendar.module"
import { ScheduleModule } from "./schedule/schedule.module"
import { TransactionsModule } from "./transactions/transactions.module"
import { ProductsModule } from "./products/products.module"
import { ReportsModule } from "./reports/reports.module"
import { OrdersModule } from "./orders/orders.module"
import { PrismaModule } from "./prisma/prisma.module"
import { ConfigModule } from "@nestjs/config"
import { APP_GUARD } from "@nestjs/core" // <-- DŮLEŽITÝ IMPORT
import { JwtAuthGuard } from "./auth/jwt-auth.guard" // <-- DŮLEŽITÝ IMPORT
import { RolesGuard } from "./auth/roles.guard"

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
  ],
  controllers: [AppController],
  // OPRAVA ZDE: Tímto nastavíme stráž jako globální pro celou aplikaci
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
