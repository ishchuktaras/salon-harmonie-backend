import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- AKTUALIZOVANÝ BLOK PRO CORS ---
  const whitelist = [
    'https://salon-harmonie-frontend.vercel.app', // Produkční frontend
    'http://localhost:3000',                      // Lokální vývoj
    'http://localhost:3001',
  ];

  app.enableCors({
    origin: function (origin, callback) {
      // Povolit požadavky bez 'origin' (např. Postman) nebo pokud je origin v whitelistu
      if (!origin || whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } 
      // Povolit všechny subdomény a preview URL z vercel.app
      else if (origin.endsWith('.vercel.app')) {
        callback(null, true);
      }
      // Jinak zamítnout
      else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  // ---------------------------------------------

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();