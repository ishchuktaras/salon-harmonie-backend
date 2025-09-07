import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/public.decorator'; 

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

    @Get('health-check')
  @Public() // Zajistí, že nepotřebujeme přihlášení
  healthCheck() {
    // Tato zpráva se objeví v "Runtime Logs" na Vercelu, pokud server běží
    console.log('✅ Health check endpoint byl úspěšně zavolán.');
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
  // -----------------------------------------
}