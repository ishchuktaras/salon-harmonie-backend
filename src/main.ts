// backend/src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Doporučené pro bezpečnost
      transform: true,
    }),
  );

  // NASTAVENÍ CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL, // Načítá adresu z Vercel proměnných
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Port pro Vercel není kritický, ale 3000 je standard
  await app.listen(3000);
}
bootstrap();