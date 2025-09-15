// src/pohoda/pohoda.service.ts

import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Client, Transaction } from '@prisma/client';
import { firstValueFrom } from 'rxjs';
import { xml2js, ElementCompact } from 'xml-js';
import * as iconv from 'iconv-lite';
import { AxiosResponse } from 'axios';

@Injectable()
export class PohodaService {
  private readonly logger = new Logger(PohodaService.name);
  private readonly pohodaUrl: string;
  private readonly pohodaIco: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    const pohodaUrl = this.configService.get<string>('POHODA_API_URL');
    const pohodaIco = this.configService.get<string>('POHODA_ICO');

    if (!pohodaUrl || !pohodaIco) {
      throw new InternalServerErrorException('Pohoda API URL or ICO is not configured.');
    }

    this.pohodaUrl = pohodaUrl;
    this.pohodaIco = pohodaIco;
  }

  /**
   * Creates an invoice (prodejka) in Pohoda from a transaction object.
   * @param transaction The transaction object from our database.
   * @returns The ID of the created invoice in Pohoda.
   */
  async createInvoice(transaction: Transaction & { items: any[], client: Client }): Promise<string> {
    const xml = this.buildInvoiceXml(transaction);
    const response = await this.sendXmlRequest(xml);
    
    // TODO: Parse the response and extract the created invoice ID
    this.logger.log('Invoice creation response:', JSON.stringify(response, null, 2));
    
    return 'pohoda-id-placeholder';
  }

  /**
   * Creates a new address book entry in Pohoda for a client.
   * @param client The client object from our database.
   * @returns The ID of the created address book entry in Pohoda.
   */
  async createAddressbookEntry(client: Client): Promise<string> {
    const xml = this.buildAddressbookXml(client);
    const response = await this.sendXmlRequest(xml);

    // TODO: Parse the response and extract the created address book ID
    this.logger.log('Address book creation response:', JSON.stringify(response, null, 2));

    return 'pohoda-id-placeholder';
  }

  /**
   * Sends the XML request to the Pohoda mServer.
   * @param xmlData The XML string to send.
   * @returns The XML response from Pohoda parsed as a JavaScript object.
   */
  private async sendXmlRequest(xmlData: string): Promise<ElementCompact> {
    try {
      // Pohoda uses Windows-1250 encoding
      const encodedXml = iconv.encode(xmlData, 'win1250');

      const response: AxiosResponse<ArrayBuffer> = await firstValueFrom(
        this.httpService.post(this.pohodaUrl, encodedXml, {
          headers: {
            'Content-Type': 'application/xml; charset=Windows-1250',
            'Accept': 'application/xml',
          },
          responseType: 'arraybuffer',
        }),
      );
      
      const decodedResponse = iconv.decode(Buffer.from(response.data), 'win1250');
      const parsedResponse = xml2js(decodedResponse, { compact: true });

      return parsedResponse;
    } catch (error) {
      const errorResponse = error.response?.data ? iconv.decode(Buffer.from(error.response.data), 'win1250') : error.message;
      this.logger.error('Error sending XML to Pohoda:', errorResponse);
      throw new InternalServerErrorException('Failed to communicate with Pohoda API.');
    }
  }

  /**
   * Builds the XML for creating a new invoice (prodejka).
   * @param transaction The transaction object.
   * @returns The generated XML string.
   */
  private buildInvoiceXml(transaction: Transaction & { items: any[], client: Client }): string {
    const today = new Date().toISOString().split('T')[0];

    const xmlHeader = `<?xml version="1.0" encoding="Windows-1250"?>
<dat:dataPack xmlns:dat="http://www.stormware.cz/schema/version_2/data.xsd" 
              xmlns:pro="http://www.stormware.cz/schema/version_2/prodejka.xsd"
              xmlns:typ="http://www.stormware.cz/schema/version_2/type.xsd"
              id="prodejka001" ico="${this.pohodaIco}" application="SalonHarmonie" version="2.0" note="Import prodejky">`;

    const xmlItems = transaction.items.map(item => `
            <pro:prodejkaItem>
              <pro:text>${item.name}</pro:text>
              <pro:quantity>${item.quantity}</pro:quantity>
              <pro:unitPrice>${item.price}</pro:unitPrice>
              <pro:note>Položka ze Salonu Harmonie</pro:note>
            </pro:prodejkaItem>`).join('');

    const xmlBody = `
      <dat:dataPackItem id="prodejkaItem001" version="2.0">
        <pro:prodejka version="2.0">
          <pro:prodejkaHeader>
            <pro:date>${today}</pro:date>
            <pro:text>Prodej ze systému Salon Harmonie</pro:text>
            <pro:partnerAddress>
              <typ:company>${transaction.client.firstName} ${transaction.client.lastName}</typ:company>
              <typ:email>${transaction.client.email}</typ:email>
            </pro:partnerAddress>
            <pro:paymentType>
                <typ:paymentType>Hotově</typ:paymentType>
            </pro:paymentType>
          </pro:prodejkaHeader>
          <pro:prodejkaDetail>
            ${xmlItems}
          </pro:prodejkaDetail>
        </pro:prodejka>
      </dat:dataPackItem>`;
      
    const xmlFooter = `
</dat:dataPack>`;

    return xmlHeader + xmlBody + xmlFooter;
  }

  /**
   * Builds the XML for creating a new address book entry.
   * @param client The client object.
   * @returns The generated XML string.
   */
  private buildAddressbookXml(client: Client): string {
    return `<?xml version="1.0" encoding="Windows-1250"?>
<dat:dataPack xmlns:dat="http://www.stormware.cz/schema/version_2/data.xsd" 
              xmlns:adb="http://www.stormware.cz/schema/version_2/addressbook.xsd"
              xmlns:typ="http://www.stormware.cz/schema/version_2/type.xsd"
              id="adresar001" ico="${this.pohodaIco}" application="SalonHarmonie" version="2.0" note="Import adresáře">
  <dat:dataPackItem id="adresarItem001" version="2.0">
    <adb:addressbook version="2.0">
      <adb:addressbookHeader>
        <adb:identity>
          <typ:address>
            <typ:company>${client.firstName} ${client.lastName}</typ:company>
            <typ:email>${client.email}</typ:email>
            <typ:phone>${client.phone}</typ:phone>
          </typ:address>
        </adb:identity>
      </adb:addressbookHeader>
    </adb:addressbook>
  </dat:dataPackItem>
</dat:dataPack>`;
  }
}

