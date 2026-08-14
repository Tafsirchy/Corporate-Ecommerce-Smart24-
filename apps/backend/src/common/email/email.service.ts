import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { getVerificationEmail } from './templates/verification.template';
import { getWelcomeEmail } from './templates/welcome.template';
import { getPasswordResetEmail } from './templates/password-reset.template';
import { getPasswordChangedEmail } from './templates/password-changed.template';
import { getOrderConfirmationEmail } from './templates/order-confirmation.template';
import { getOrderDeliveredEmail } from './templates/order-delivered.template';
import { getSupportTicketEmail } from './templates/support-ticket.template';
import { getSubscriptionInvoiceEmail } from './templates/subscription-invoice.template';
import { getAbandonedCartEmail } from './templates/abandoned-cart.template';
import { getBackInStockEmail } from './templates/back-in-stock.template';
import { getContactFormEmail } from './templates/contact-form.template';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  private readonly defaultFrom =
    process.env.EMAIL_FROM ||
    'Smart24 Support <official.smart24.live@gmail.com>';
  private readonly frontendUrl =
    process.env.FRONTEND_URL || 'http://localhost:3000';

  constructor() {
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      this.logger.warn(
        'SMTP_USER or SMTP_PASS is not set. EmailService will mock email sends.',
      );
    }
  }

  /**
   * Internal generic send function wrapped with error handling and retries
   */
  private async sendEmail(
    to: string,
    subject: string,
    html: string,
    text: string,
    retries = 3,
  ) {
    if (!this.transporter) {
      this.logger.debug(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
      this.logger.debug(`[MOCK EMAIL CONTENT]\\n${html}`);
      return;
    }

    const replyTo = process.env.SUPPORT_EMAIL || 'support@smart24.com';
    let attempt = 0;

    while (attempt < retries) {
      try {
        const response = await this.transporter.sendMail({
          from: this.defaultFrom,
          to,
          subject,
          html,
          text,
          replyTo,
        });

        this.logger.log(
          `Email sent successfully to ${to}. ID: ${response.messageId}`,
        );
        return response;
      } catch (error) {
        attempt++;
        this.logger.error(
          `Attempt ${attempt} failed to send email to ${to}`,
          error,
        );

        if (attempt >= retries) {
          this.logger.error(
            `Final attempt failed to send email to ${to}. Giving up.`,
          );
          return;
        }

        const delay = Math.pow(2, attempt - 1) * 1000;
        await new Promise((res) => setTimeout(res, delay));
      }
    }
  }

  async sendVerificationEmail(email: string, token: string) {
    const verificationUrl = `${this.frontendUrl}/verify-email?token=${token}`;

    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(
        `\\n======================================================\\n[TESTING] Verification URL for ${email}:\\n${verificationUrl}\\n======================================================\\n`,
      );
    }

    const subject = 'Verify your email address - Smart24';
    const { html, text } = getVerificationEmail(verificationUrl);
    return this.sendEmail(email, subject, html, text);
  }

  async sendWelcomeEmail(email: string, userName: string) {
    const subject = 'Welcome to Smart24!';
    const { html, text } = getWelcomeEmail(userName, this.frontendUrl);
    return this.sendEmail(email, subject, html, text);
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `${this.frontendUrl}/reset-password?token=${token}`;
    const subject = 'Reset your password - Smart24';
    const { html, text } = getPasswordResetEmail(resetUrl);
    return this.sendEmail(email, subject, html, text);
  }

  async sendPasswordChangedAlert(email: string, userName: string) {
    const subject = 'Security Alert: Your password was changed';
    const { html, text } = getPasswordChangedEmail(userName);
    return this.sendEmail(email, subject, html, text);
  }

  async sendOrderConfirmationEmail(
    email: string,
    orderId: string,
    grandTotal: number,
    userName: string,
  ) {
    const subject = `Order Confirmation - ${orderId}`;
    const { html, text } = getOrderConfirmationEmail(
      orderId,
      grandTotal,
      userName,
      this.frontendUrl,
    );
    return this.sendEmail(email, subject, html, text);
  }

  async sendOrderDeliveredEmail(email: string, orderId: string) {
    const subject = `Order Delivered - ${orderId}`;
    const { html, text } = getOrderDeliveredEmail(orderId, this.frontendUrl);
    return this.sendEmail(email, subject, html, text);
  }

  async sendSupportTicketEmail(adminEmail: string, ticket: any) {
    const subject = `New Support Ticket: ${ticket.subject}`;
    const { html, text } = getSupportTicketEmail(ticket);
    return this.sendEmail(adminEmail, subject, html, text);
  }

  async sendSubscriptionInvoiceEmail(
    email: string,
    userName: string,
    orderId: string,
    amount: number,
  ) {
    const subject = `Invoice for your Subscription (Order #${orderId})`;
    const { html, text } = getSubscriptionInvoiceEmail(
      userName,
      orderId,
      amount,
      this.frontendUrl,
    );
    return this.sendEmail(email, subject, html, text);
  }

  async sendAbandonedCartEmail(email: string, userName: string) {
    const subject = 'Did you forget something?';
    const { html, text } = getAbandonedCartEmail(userName, this.frontendUrl);
    return this.sendEmail(email, subject, html, text);
  }

  async sendBackInStockEmail(email: string, productName: string) {
    const subject = `${productName} is back in stock!`;
    const { html, text } = getBackInStockEmail(productName, this.frontendUrl);
    return this.sendEmail(email, subject, html, text);
  }

  async sendContactEmail(
    data: { name: string; email: string; company?: string; message: string },
    adminEmail: string = 'support@smart24.com',
  ) {
    const subject = `New Contact Form Submission from ${data.name}`;
    const { html, text } = getContactFormEmail(data);
    return this.sendEmail(adminEmail, subject, html, text);
  }
}
