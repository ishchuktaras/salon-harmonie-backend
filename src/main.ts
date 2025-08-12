import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  // TATO CEDULKA POVOLÍ PŘÍSTUP Z JINÝCH ADRES (NAPŘ. Z NAŠEHO FRONTENDU)
  app.enableCors();

  // Tento řádek zajišťuje, že server poslouchá na všech síťových rozhraních
  await app.listen(3000, '0.0.0.0');
}
bootstrap();