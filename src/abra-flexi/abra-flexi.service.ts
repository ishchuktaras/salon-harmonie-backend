// src/abra-flexi/abra-flexi.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Client } from '@prisma/client';

@Injectable()
export class AbraFlexiService {
  private readonly logger = new Logger(AbraFlexiService.name);
  private readonly apiUrl: string;
  private readonly user: string;
  private readonly pass: string;

  constructor(private configService: ConfigService) {
    const apiUrl = this.configService.get<string>('ABRA_FLEXI_URL');
    const user = this.configService.get<string>('ABRA_FLEXI_USER');
    const pass = this.configService.get<string>('ABRA_FLEXI_PASSWORD');

    if (!apiUrl || !user || !pass) {
      throw new Error('Chybí přístupové údaje pro ABRA Flexi v .env souboru!');
    }

    this.apiUrl = apiUrl;
    this.user = user;
    this.pass = pass;
  }

  async sendDailySummary(totalRevenue: number, date: string) {
    this.logger.log(`Odesílám souhrn tržeb do ABRA Flexi pro den ${date}...`);
    this.logger.log(`Celková tržba: ${totalRevenue / 100} Kč`);

    // Prozatím jen simulujeme úspěch a vrátíme zprávu.
    this.logger.log('Simulace odeslání do ABRA Flexi proběhla úspěšně.');
    return { success: true, message: 'Simulace odeslání do ABRA Flexi proběhla úspěšně.' };
  }

  async createClientInAbraFlexi(client: Client) {
    this.logger.log(`Zakládám klienta ${client.firstName} ${client.lastName} v ABRA Flexi...`);
    
    // Prozatím jen simulujeme úspěch.
    this.logger.log('Simulace založení klienta v ABRA Flexi proběhla úspěšně.');
    return { success: true, message: 'Simulace založení klienta proběhla úspěšně.' };
  }
}