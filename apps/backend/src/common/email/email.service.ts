import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;
  private readonly logger = new Logger(EmailService.name);

  // Set default fallback domain for sender if EMAIL_FROM is not set
  private readonly defaultFrom =
    process.env.EMAIL_FROM || 'Smart24 Support <onboarding@resend.dev>';
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

  private escapeHtml(unsafe: string): string {
    if (!unsafe) return '';
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Internal generic send function wrapped with error handling and retries
   */
  private async sendEmail(
    to: string,
    subject: string,
    html: string,
    text?: string,
    retries = 3,
  ) {
    if (!this.resend) {
      this.logger.debug(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
      this.logger.debug(`[MOCK EMAIL CONTENT]\n${html}`);
      return;
    }

    const replyTo = process.env.SUPPORT_EMAIL || 'support@smart24.com';
    let attempt = 0;

    while (attempt < retries) {
      try {
        const response = await this.resend.emails.send({
          from: this.defaultFrom,
          to,
          subject,
          html,
          text: text || html.replace(/<[^>]*>?/gm, ''), // basic fallback text
          replyTo: replyTo,
        });

        if (response.error) {
          throw new Error(response.error.message || 'Unknown Resend error');
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
          // Not throwing to prevent blocking the main thread
          return;
        }

        // Exponential backoff: 1s, 2s, 4s...
        const delay = Math.pow(2, attempt - 1) * 1000;
        await new Promise((res) => setTimeout(res, delay));
      }
    }
  }

  async sendVerificationEmail(email: string, token: string) {
    const verificationUrl = `${this.frontendUrl}/verify-email?token=${token}`;
    
    // Log the URL for local testing purposes when email sending fails
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(`\n======================================================\n[TESTING] Verification URL for ${email}:\n${verificationUrl}\n======================================================\n`);
    }
    
    const subject = 'Verify your email address - Smart24';
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2>Welcome to Smart24!</h2>
        <p>Please verify your email address by clicking the button below:</p>
        <div style="margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email Address</a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
      </div>
    `;
    return this.sendEmail(email, subject, html);
  }

  async sendWelcomeEmail(email: string, userName: string) {
    const subject = 'Welcome to Smart24!';
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2>Welcome aboard, ${this.escapeHtml(userName)}! 🎉</h2>
        <p>Your email has been successfully verified, and your account is now fully active.</p>
        <p>We are thrilled to have you join the Smart24 platform. Start exploring our wide range of products and enjoy exclusive deals just for you.</p>
        <div style="margin: 30px 0;">
          <a href="${this.frontendUrl}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Shop Now</a>
        </div>
        <p>If you have any questions or need assistance, our support team is always here to help.</p>
      </div>
    `;
    return this.sendEmail(email, subject, html);
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `${this.frontendUrl}/reset-password?token=${token}`;
    const subject = 'Reset your password - Smart24';
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2>Password Reset Request</h2>
        <p>You recently requested to reset your password for your Smart24 account. Click the button below to reset it.</p>
        <div style="margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
        </div>
        <p>Or copy and paste this link into your browser:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This password reset is only valid for the next 15 minutes.</p>
        <p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
      </div>
    `;
    return this.sendEmail(email, subject, html);
  }

  async sendPasswordChangedAlert(email: string, userName: string) {
    const subject = 'Security Alert: Your password was changed';
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2>Password Changed Successfully</h2>
        <p>Hi ${this.escapeHtml(userName)},</p>
        <p>This is a confirmation that the password for your Smart24 account was recently changed.</p>
        <p>If you made this change, no further action is required.</p>
        <div style="margin: 30px 0; padding: 15px; border: 1px solid #ff4d4f; border-radius: 4px; background-color: #fff1f0;">
          <p style="margin: 0; color: #cf1322;"><strong>Didn't make this change?</strong></p>
          <p style="margin: 10px 0 0 0;">Please contact our support team immediately or reset your password again to secure your account.</p>
        </div>
      </div>
    `;
    return this.sendEmail(email, subject, html);
  }

  async sendOrderConfirmationEmail(
    email: string,
    orderId: string,
    grandTotal: number,
    userName: string,
  ) {
    const subject = `Order Confirmation - ${orderId}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2>Thank you for your order, ${userName}!</h2>
        <p>Your order <strong>#${orderId.slice(-6).toUpperCase()}</strong> has been received and is now being processed.</p>
        <p><strong>Total Amount:</strong> ৳${grandTotal}</p>
        <div style="margin: 30px 0;">
          <a href="${this.frontendUrl}/track-order?id=${orderId}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Track Your Order</a>
        </div>
        <p>If you have any questions, please reply to this email.</p>
      </div>
    `;
    return this.sendEmail(email, subject, html);
  }

  async sendOrderDeliveredEmail(email: string, orderId: string) {
    const subject = `Order Delivered - ${orderId}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2>Your order has arrived!</h2>
        <p>Your order <strong>#${orderId.slice(-6).toUpperCase()}</strong> has been successfully delivered.</p>
        <p>We hope you enjoy your products!</p>
        <div style="margin: 30px 0;">
          <a href="${this.frontendUrl}/account/reviews" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Leave a Review</a>
        </div>
      </div>
    `;
    return this.sendEmail(email, subject, html);
  }

  async sendSupportTicketEmail(adminEmail: string, ticket: any) {
    const subject = `New Support Ticket: ${this.escapeHtml(ticket.subject)}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2>New Support Ticket</h2>
        <p><strong>From:</strong> ${this.escapeHtml(ticket.name)} (${this.escapeHtml(ticket.email)})</p>
        <p><strong>Subject:</strong> ${this.escapeHtml(ticket.subject)}</p>
        ${ticket.orderId ? `<p><strong>Linked Order ID:</strong> ${this.escapeHtml(ticket.orderId)}</p>` : ''}
        <p><strong>Message:</strong></p>
        <p style="background: #f5f5f5; padding: 15px; border-radius: 4px;">${this.escapeHtml(ticket.message)}</p>
        ${ticket.attachments && ticket.attachments.length > 0 ? `<p><strong>Attachments:</strong></p><ul>${ticket.attachments.map((url: string) => `<li><a href="${this.escapeHtml(url)}">${this.escapeHtml(url)}</a></li>`).join('')}</ul>` : ''}
      </div>
    `;
    return this.sendEmail(adminEmail, subject, html);
  }

  async sendSubscriptionInvoiceEmail(
    email: string,
    userName: string,
    orderId: string,
    amount: number,
  ) {
    const subject = `Invoice for your Subscription (Order #${orderId})`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2>Hello ${userName},</h2>
        <p>Your monthly subscription order has been generated.</p>
        <p><strong>Total Amount:</strong> ৳${amount}</p>
        <p>Please log in to your account to process the payment so we can prepare your delivery.</p>
        <div style="margin: 30px 0;">
          <a href="${this.frontendUrl}/account/orders" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Pay Invoice</a>
        </div>
        <p>Thank you for choosing Smart24!</p>
      </div>
    `;
    return this.sendEmail(email, subject, html);
  }

  async sendAbandonedCartEmail(email: string, userName: string) {
    const subject = 'Did you forget something?';
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2>Hi ${userName},</h2>
        <p>You left some items in your cart. Come back and complete your purchase before they sell out!</p>
        <div style="margin: 30px 0;">
          <a href="${this.frontendUrl}/cart" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">View Cart</a>
        </div>
        <p>Thank you for shopping with Smart24!</p>
      </div>
    `;
    return this.sendEmail(email, subject, html);
  }

  async sendBackInStockEmail(email: string, productName: string) {
    const subject = `${productName} is back in stock!`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2>Great news!</h2>
        <p>The product you were waiting for, <strong>${productName}</strong>, is back in stock.</p>
        <p>Grab it before it runs out again!</p>
        <div style="margin: 30px 0;">
          <a href="${this.frontendUrl}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Shop Now</a>
        </div>
        <p>Thank you for shopping with Smart24!</p>
      </div>
    `;
    return this.sendEmail(email, subject, html);
  }

  async sendContactEmail(
    data: { name: string; email: string; company?: string; message: string },
    adminEmail: string = 'support@smart24.com',
  ) {
    const subject = `New Contact Form Submission from ${this.escapeHtml(data.name)}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${this.escapeHtml(data.name)}</p>
        <p><strong>Email:</strong> ${this.escapeHtml(data.email)}</p>
        <p><strong>Company:</strong> ${this.escapeHtml(data.company || 'N/A')}</p>
        <p><strong>Message:</strong></p>
        <p style="background: #f5f5f5; padding: 15px; border-radius: 4px;">${this.escapeHtml(data.message)}</p>
      </div>
    `;
    return this.sendEmail(adminEmail, subject, html);
  }
}
