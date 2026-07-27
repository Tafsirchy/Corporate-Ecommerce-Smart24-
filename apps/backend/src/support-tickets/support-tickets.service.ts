import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { Resend } from 'resend';
import { SupportTicketStatus } from '@prisma/client';

@Injectable()
export class SupportTicketsService {
  private resend: Resend;

  constructor(
    private prisma: PrismaService,
    private settingsService: SettingsService,
  ) {
    if (process.env.RESEND_API_KEY) {
      this.resend = new Resend(process.env.RESEND_API_KEY);
    }
  }

  async createTicket(data: { name: string; email: string; subject: string; message: string; userId?: string; orderId?: string; attachments?: string[] }) {
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
    const supportEmailSetting = await this.settingsService.getSetting('SUPPORT_EMAIL');
    const supportEmail = supportEmailSetting?.value;

    if (supportEmail) {
      if (this.resend) {
        await this.resend.emails.send({
          from: 'Smart24 Support <onboarding@resend.dev>', // Should be a verified domain in production
          to: supportEmail,
          subject: `New Support Ticket: ${ticket.subject}`,
          html: `
            <h2>New Support Ticket</h2>
            <p><strong>From:</strong> ${ticket.name} (${ticket.email})</p>
            <p><strong>Subject:</strong> ${ticket.subject}</p>
            ${ticket.orderId ? `<p><strong>Linked Order ID:</strong> ${ticket.orderId}</p>` : ''}
            <p><strong>Message:</strong></p>
            <p>${ticket.message}</p>
            ${ticket.attachments.length > 0 ? `<p><strong>Attachments:</strong></p><ul>${ticket.attachments.map(url => `<li><a href="${url}">${url}</a></li>`).join('')}</ul>` : ''}
          `,
        });
      } else {
        console.log(`\n\n[MOCK EMAIL] To: ${supportEmail}\nSubject: New Support Ticket: ${ticket.subject}\nMessage: ${ticket.message}\n\n`);
      }
    }

    return ticket;
  }

  async getAllTickets(page: number = 1, limit: number = 10, search?: string, status?: SupportTicketStatus) {
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
