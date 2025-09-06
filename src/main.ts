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

  // --- CORS ---
  // Povolíme přístup pro specifickou doménu frontendu.
  // V produkci je důležité nepoužívat "*", ale konkrétní URL.
  app.enableCors({
    origin: [
      'https://salon-harmonie-frontend.vercel.app', // Povolení pro produkční frontend
      'http://localhost:3000',                      // Povolení pro lokální vývoj
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  // -------------------

  // Port pro Vercel není kritický, ale 3000 je standard
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
