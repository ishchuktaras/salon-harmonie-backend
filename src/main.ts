// backend/src/main.ts - Dočasná verze pro testování

import { Controller, Get, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

// 1. Jednoduchý Controller
@Controller()
class AppController {
  @Get()
  getHello(): string {
    return 'Hello World from NestJS!';
  }

  @Get('test')
  getTest(): object {
    return { message: 'Test endpoint is working!' };
  }
}

// 2. Jednoduchý Module
@Module({
  controllers: [AppController],
})
class AppModule {}

// 3. Bootstrap Funkce
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Povolíme CORS pro všechny pro účely testu
  app.enableCors(); 

  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();