import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter | null;
  private readonly from: string;
  private readonly frontendUrl: string;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST');
    this.from = this.config.get<string>(
      'MAIL_FROM',
      'TiendaRopa <noreply@tiendaropa.local>',
    );
    this.frontendUrl = this.config.get<string>(
      'FRONTEND_URL',
      'http://localhost:5173',
    );

    if (!host) {
      this.transporter = null;
      this.logger.log(
        'SMTP no configurado: los correos se registran en el log',
      );
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port: Number(this.config.get('SMTP_PORT') ?? 587),
      secure: this.config.get('SMTP_SECURE') === 'true',
      auth: this.config.get('SMTP_USER')
        ? {
            user: this.config.get<string>('SMTP_USER'),
            pass: this.config.get<string>('SMTP_PASS'),
          }
        : undefined,
    });
  }

  async notifyOrderPaid(
    to: string,
    order: { id: string; totalAmount: number | string },
  ) {
    const subject = `Pedido confirmado · ${order.id.slice(0, 8)}`;
    const total = Number(order.totalAmount).toFixed(2);
    const text = [
      'Recibimos tu comprobante de transferencia y el pedido quedó marcado como pagado.',
      `Pedido: ${order.id}`,
      `Total: $${total}`,
      `Seguimiento: ${this.frontendUrl}/orders`,
    ].join('\n');

    if (!this.transporter) {
      this.logger.log(`[mail:dry-run] to=${to} ${subject}`);
      return;
    }

    try {
      await this.transporter.sendMail({ from: this.from, to, subject, text });
    } catch (err) {
      this.logger.error(`No se pudo enviar el correo a ${to}`, err as Error);
    }
  }
}
