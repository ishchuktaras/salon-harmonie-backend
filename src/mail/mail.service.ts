// src/mail/mail.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Reservation, Client, Service, User } from '@prisma/client';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    // Pro testování použijeme Ethereal. V produkci bychom zde měli
    // údaje z .env souboru pro reálný SMTP server.
    nodemailer.createTestAccount((err, account) => {
      if (err) {
        this.logger.error('Nepodařilo se vytvořit testovací e-mailový účet', err);
        return;
      }
      this.transporter = nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: {
          user: account.user,
          pass: account.pass,
        },
      });
      this.logger.log('Testovací e-mailový účet úspěšně vytvořen.');
    });
  }

  async sendReservationConfirmation(
    reservationDetails: Reservation & { client: Client; service: Service; therapist: User },
  ) {
    if (!this.transporter) {
      this.logger.error('Transporter není inicializován. E-mail nelze odeslat.');
      return;
    }

    const { client, service, startTime } = reservationDetails;

    const mailOptions = {
      from: '"Salon Harmonie" <noreply@salonharmonie.cz>',
      to: client.email,
      subject: 'Potvrzení vaší rezervace v Salonu Harmonie',
      html: `
        <h1>Děkujeme za vaši rezervaci!</h1>
        <p>Dobrý den, ${client.firstName},</p>
        <p>tímto potvrzujeme vaši rezervaci na službu:</p>
        <p><strong>Služba:</strong> ${service.name}</p>
        <p><strong>Datum a čas:</strong> ${new Date(
          startTime,
        ).toLocaleString('cs-CZ')}</p>
        <p>Těšíme se na vaši návštěvu!</p>
        <p>S pozdravem,<br>Tým Salonu Harmonie</p>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log('E-mail byl úspěšně odeslán.');
      // Důležité: Tento odkaz se zobrazí jen v logu a slouží pro zobrazení e-mailu!
      this.logger.log('Náhled e-mailu: ' + nodemailer.getTestMessageUrl(info));
    } catch (error) {
      this.logger.error('Chyba při odesílání e-mailu', error);
    }
  }
}
