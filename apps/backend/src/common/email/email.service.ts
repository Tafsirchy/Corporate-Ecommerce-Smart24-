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
  private resend?: Resend;
  private readonly logger = new Logger(EmailService.name);

  private readonly defaultFrom =
    process.env.EMAIL_FROM || 'Smart24 Support <support@smart24.live>';

  private get frontendUrl(): string {
    const raw = process.env.FRONTEND_URL || 'http://localhost:3000';
    return raw.replace(/\/$/, '');
  }

  constructor() {
    if (process.env.RESEND_API_KEY) {
      this.resend = new Resend(process.env.RESEND_API_KEY);
      this.logger.log('EmailService initialized with Resend provider.');
    } else {
      this.logger.warn(
        'RESEND_API_KEY is not set. EmailService will mock email sends.',
      );
    }
  }

  /**
   * Internal generic send function wrapped with error handling, backoff retries, and deliverability headers
   */
  private async sendEmail(
    to: string,
    subject: string,
    html: string,
    text: string,
    retries = 3,
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    if (!this.resend) {
      this.logger.debug(
        `[MOCK EMAIL] To: ${to} | Subject: ${subject} | (Length: ${html.length} chars)`,
      );
      return { success: true, id: 'mock-id' };
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
          replyTo,
          headers: {
            'List-Unsubscribe': `<mailto:unsubscribe@smart24.live?subject=unsubscribe>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          },
        });

        if (response.error) {
          throw new Error(response.error.message);
        }

        this.logger.log(
          `Email sent successfully to ${to}. Message ID: ${response.data?.id}`,
        );
        return { success: true, id: response.data?.id };
      } catch (error: any) {
        attempt++;
        this.logger.error(
          `Attempt ${attempt} of ${retries} failed to send email to ${to}: ${error.message || error}`,
        );

        if (attempt >= retries) {
          const finalErrMsg = `Failed to deliver email to ${to} after ${retries} attempts: ${error.message || error}`;
          this.logger.error(finalErrMsg);
          return { success: false, error: finalErrMsg };
        }

        const delay = Math.pow(2, attempt - 1) * 1000;
        await new Promise((res) => setTimeout(res, delay));
      }
    }

    return { success: false, error: 'Maximum retries exceeded' };
  }

  async sendVerificationEmail(email: string, otpCode: string): Promise<void> {
    if (process.env.NODE_ENV !== 'production') {
      const masked = otpCode.length > 2 ? `***${otpCode.slice(-2)}` : '***';
      this.logger.debug(`[TESTING] Verification OTP dispatched to ${email}: ${masked}`);
    }

    const verificationUrl = `${this.frontendUrl}/verify-email?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otpCode)}&token=${encodeURIComponent(otpCode)}`;
    const subject = 'Verify your email address - Smart24';
    const { html, text } = getVerificationEmail(otpCode, verificationUrl);
    await this.sendEmail(email, subject, html, text);
  }

  async sendWelcomeEmail(email: string, userName: string) {
    const subject = 'Welcome to Smart24!';
    const { html, text } = getWelcomeEmail(userName, this.frontendUrl);
    return this.sendEmail(email, subject, html, text);
  }

  async sendPasswordResetEmail(email: string, otpCode: string) {
    if (process.env.NODE_ENV !== 'production') {
      const masked = otpCode.length > 2 ? `***${otpCode.slice(-2)}` : '***';
      this.logger.debug(`[TESTING] Password reset OTP dispatched to ${email}: ${masked}`);
    }

    const resetUrl = `${this.frontendUrl}/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otpCode)}`;
    const subject = 'Reset your password - Smart24';
    const { html, text } = getPasswordResetEmail(otpCode, resetUrl);
    return this.sendEmail(email, subject, html, text);
  }

  async sendPasswordChangedAlert(email: string, userName: string) {
    const subject = 'Security Alert: Your password was changed - Smart24';
    const { html, text } = getPasswordChangedEmail(userName);
    return this.sendEmail(email, subject, html, text);
  }

  async sendOrderConfirmationEmail(
    email: string,
    orderId: string,
    grandTotal: number,
    userName: string,
  ) {
    const subject = `Order Confirmation - ${orderId} - Smart24`;
    const { html, text } = getOrderConfirmationEmail(
      orderId,
      grandTotal,
      userName,
      this.frontendUrl,
    );
    return this.sendEmail(email, subject, html, text);
  }

  async sendOrderDeliveredEmail(email: string, orderId: string) {
    const subject = `Order Delivered - ${orderId} - Smart24`;
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
    const subject = `Invoice for your Subscription (Order #${orderId}) - Smart24`;
    const { html, text } = getSubscriptionInvoiceEmail(
      userName,
      orderId,
      amount,
      this.frontendUrl,
    );
    return this.sendEmail(email, subject, html, text);
  }

  async sendAbandonedCartEmail(email: string, userName: string) {
    const subject = 'Did you forget something? - Smart24';
    const { html, text } = getAbandonedCartEmail(userName, this.frontendUrl);
    return this.sendEmail(email, subject, html, text);
  }

  async sendBackInStockEmail(email: string, productName: string) {
    const subject = `${productName} is back in stock! - Smart24`;
    const { html, text } = getBackInStockEmail(productName, this.frontendUrl);
    return this.sendEmail(email, subject, html, text);
  }

  async sendContactEmail(
    data: { name: string; email: string; company?: string; message: string },
    adminEmail: string = 'support@smart24.live',
  ) {
    const subject = `New Contact Form Submission from ${data.name}`;
    const { html, text } = getContactFormEmail(data);
    return this.sendEmail(adminEmail, subject, html, text);
  }
}
