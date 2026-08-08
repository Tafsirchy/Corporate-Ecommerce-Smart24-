import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { EmailService } from '../common/email/email.service';
import { SupportTicketStatus } from '@prisma/client';

@Injectable()
export class SupportTicketsService {
  constructor(
    private prisma: PrismaService,
    private settingsService: SettingsService,
    private emailService: EmailService,
  ) {}

  async createTicket(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
    userId?: string;
    orderId?: string;
    attachments?: string[];
  }) {
    const ticket = await this.prisma.supportTicket.create({
      data: {
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        userId: data.userId,
        orderId: data.orderId,
        attachments: data.attachments || [],
      },
    });

    // Fetch the admin support email from settings
    const supportEmailSetting =
      await this.settingsService.getSetting('SUPPORT_EMAIL');
    const supportEmail = supportEmailSetting?.value;

    if (supportEmail) {
      this.emailService
        .sendSupportTicketEmail(supportEmail, ticket)
        .catch((err) => {
          console.error('Failed to send support ticket email:', err);
        });
    }

    return ticket;
  }

  async getAllTickets(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: SupportTicketStatus,
  ) {
    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.supportTicket.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTicketById(id: string) {
    return this.prisma.supportTicket.findUnique({
      where: { id },
    });
  }

  async updateTicketStatus(id: string, status: SupportTicketStatus) {
    return this.prisma.supportTicket.update({
      where: { id },
      data: { status },
    });
  }

  async deleteTicket(id: string) {
    return this.prisma.supportTicket.delete({
      where: { id },
    });
  }
}
