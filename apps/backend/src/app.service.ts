import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class AppService {
  private resend: Resend;
  private readonly logger = new Logger(AppService.name);

  constructor() {
    if (process.env.RESEND_API_KEY) {
      this.resend = new Resend(process.env.RESEND_API_KEY);
    }
  }

  getHello() {
    return { status: 'ok', service: 'Corporate E-Commerce API', timestamp: new Date().toISOString() };
  }

  async submitContact(data: { name: string; email: string; company?: string; message: string }) {
    if (this.resend) {
      try {
        await this.resend.emails.send({
          from: 'Smart24 Contact <onboarding@resend.dev>', // Verified domain in production
          to: 'support@smart24.com', // Fallback email
          subject: `New Contact Form Submission from ${data.name}`,
          html: `
            <h2>New Contact Message</h2>
            <p><strong>Name:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Company:</strong> ${data.company || 'N/A'}</p>
            <p><strong>Message:</strong></p>
            <p>${data.message}</p>
          `
        });
        return { success: true, message: 'Message sent successfully.' };
      } catch (error: any) {
        this.logger.error('Failed to send contact email', error.stack);
        return { success: false, message: 'Failed to send message.' };
      }
    } else {
      this.logger.log(`\n\n[MOCK CONTACT EMAIL] From: ${data.email}\nMessage: ${data.message}\n\n`);
      return { success: true, message: 'Message sent successfully (mocked).' };
    }
  }
}
