import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from './common/email/email.service';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(private emailService: EmailService) {}

  getHello() {
    return {
      status: 'ok',
      service: 'Business E-Commerce API',
      timestamp: new Date().toISOString(),
    };
  }

  async submitContact(data: {
    name: string;
    email: string;
    company?: string;
    message: string;
  }) {
    try {
      await this.emailService.sendContactEmail(data);
      return { success: true, message: 'Message sent successfully.' };
    } catch (error: any) {
      this.logger.error('Failed to send contact email', error.stack);
      return { success: false, message: 'Failed to send message.' };
    }
  }
}
