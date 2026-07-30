import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InvoiceService {
  constructor(private prisma: PrismaService) {}

  async findAllByBusiness(businessProfileId: string) {
    return this.prisma.businessInvoice.findMany({
      where: { businessProfileId },
      include: {
        order: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: string) {
    const invoice = await this.prisma.businessInvoice.findUnique({
      where: { id },
      include: { order: true }
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async updateStatus(id: string, status: any) {
    return this.prisma.businessInvoice.update({
      where: { id },
      data: { status }
    });
  }

  // Admin endpoint
  async findAll() {
    return this.prisma.businessInvoice.findMany({
      include: {
        businessProfile: true,
        order: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
