import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;
  private readonly logger = new Logger(EmailService.name);
  
  // Set default fallback domain for sender if EMAIL_FROM is not set
  private readonly defaultFrom = process.env.EMAIL_FROM || 'Smart24 Support <onboarding@resend.dev>';
  private readonly frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  constructor() {
    if (process.env.RESEND_API_KEY) {
      this.resend = new Resend(process.env.RESEND_API_KEY);
    } else {
      this.logger.warn('RESEND_API_KEY is not set. EmailService will mock email sends.');
    }
  }

  /**
   * Internal generic send function wrapped with error handling
   */
  private async sendEmail(to: string, subject: string, html: string, text?: string) {
    if (!this.resend) {
      this.logger.debug(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
      this.logger.debug(`[MOCK EMAIL CONTENT]\n${html}`);
      return;
    }

    try {
      const response = await this.resend.emails.send({
        from: this.defaultFrom,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>?/gm, ''), // basic fallback text
      });
      
      this.logger.log(`Email sent successfully to ${to}. ID: ${response.data?.id}`);
      return response;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
      // We do not throw the error to prevent blocking the main thread (e.g. signup)
      // For a truly critical system, we might want to throw or push to a queue.
    }
  }

  async sendVerificationEmail(email: string, token: string) {
    const verificationUrl = `${this.frontendUrl}/verify-email?token=${token}`;
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

  async sendOrderConfirmationEmail(email: string, orderId: string, grandTotal: number, userName: string) {
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
    const subject = `New Support Ticket: ${ticket.subject}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2>New Support Ticket</h2>
        <p><strong>From:</strong> ${ticket.name} (${ticket.email})</p>
        <p><strong>Subject:</strong> ${ticket.subject}</p>
        ${ticket.orderId ? `<p><strong>Linked Order ID:</strong> ${ticket.orderId}</p>` : ''}
        <p><strong>Message:</strong></p>
        <p style="background: #f5f5f5; padding: 15px; border-radius: 4px;">${ticket.message}</p>
        ${ticket.attachments && ticket.attachments.length > 0 ? `<p><strong>Attachments:</strong></p><ul>${ticket.attachments.map((url: string) => `<li><a href="${url}">${url}</a></li>`).join('')}</ul>` : ''}
      </div>
    `;
    return this.sendEmail(adminEmail, subject, html);
  }

  async sendSubscriptionInvoiceEmail(email: string, userName: string, orderId: string, amount: number) {
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

  async sendContactEmail(data: { name: string; email: string; company?: string; message: string }, adminEmail: string = 'support@smart24.com') {
    const subject = `New Contact Form Submission from ${data.name}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Company:</strong> ${data.company || 'N/A'}</p>
        <p><strong>Message:</strong></p>
        <p style="background: #f5f5f5; padding: 15px; border-radius: 4px;">${data.message}</p>
      </div>
    `;
    return this.sendEmail(adminEmail, subject, html);
  }
}
