import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Vylepšené logování pro produkci
  app.useLogger(console);

  // Ponecháváme CORS nastavení i v aplikaci jako zálohu
  const whitelist = [
    'https://salon-harmonie-frontend.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
  ];
  app.enableCors({
    origin: function (origin, callback) {
      if (!origin || whitelist.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`✅ Aplikace úspěšně nastartovala na portu: ${port}`);
}

bootstrap().catch(err => {
  // Kritické logování: Pokud aplikace spadne při startu, uvidíme to zde!
  console.error('❌ Kritická chyba při startu aplikace:', err);
  process.exit(1);
});