import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
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
  private resend: Resend;
  private readonly logger = new Logger(EmailService.name);

  private readonly defaultFrom =
    process.env.EMAIL_FROM ||
    'Smart24 Support <official.smart24.live@gmail.com>';
  private readonly frontendUrl =
    process.env.FRONTEND_URL || 'http://localhost:3000';

  constructor() {
    if (process.env.RESEND_API_KEY) {
      this.resend = new Resend(process.env.RESEND_API_KEY);
    } else {
      this.logger.warn(
        'RESEND_API_KEY is not set. EmailService will mock email sends.',
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
    if (!this.resend) {
      this.logger.debug(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
      this.logger.debug(`[MOCK EMAIL CONTENT]\n${html}`);
      return;
    }

    const replyTo = process.env.SUPPORT_EMAIL || 'support@smart24.live';
    let attempt = 0;

    while (attempt < retries) {
      try {
        const response = await this.resend.emails.send({
          from: this.defaultFrom,
          to,
          subject,
          html,
          text,
          replyTo: replyTo,
          headers: {
            'List-Unsubscribe': `<mailto:unsubscribe@smart24.live?subject=unsubscribe>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          },
        });

        if (response.error) {
          throw new Error(response.error.message);
        }

        this.logger.log(
          `Email sent successfully to ${to}. ID: ${response.data?.id}`,
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

  async sendVerificationEmail(email: string, otpCode: string): Promise<void> {
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(
        `\n======================================================\n[TESTING] OTP Code for ${email}: ${otpCode}\n======================================================\n`,
      );
    }

    const subject = 'Verify your email address - Smart24';
    const { html, text } = getVerificationEmail(otpCode);
    await this.sendEmail(email, subject, html, text);
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
