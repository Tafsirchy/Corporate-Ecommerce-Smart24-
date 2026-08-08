import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RfqService {
  constructor(private readonly prisma: PrismaService) {}

  async createRfq(userId: string, data: any) {
    const businessProfile = await this.prisma.businessProfile.findUnique({
      where: { userId },
    });

    if (!businessProfile) {
      throw new NotFoundException('Business profile not found');
    }

    if (data.productItems && Array.isArray(data.productItems)) {
      const productIds = data.productItems
        .map((item: any) => item.productId)
        .filter(Boolean);
      if (productIds.length > 0) {
        const foundProducts = await this.prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true },
        });
        if (foundProducts.length !== productIds.length) {
          throw new BadRequestException('One or more product IDs are invalid');
        }
      }
    }

    return this.prisma.businessRFQ.create({
      data: {
        businessId: businessProfile.id,
        productItems: data.productItems,
        expectedBudget: data.expectedBudget,
        expectedDate: data.expectedDate,
        specFileUrl: data.specFileUrl,
        // SLA is typically 24 hours from submission
        slaDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
  }

  async getBusinessRfqs(userId: string) {
    const businessProfile = await this.prisma.businessProfile.findUnique({
      where: { userId },
    });

    if (!businessProfile) {
      return [];
    }

    return this.prisma.businessRFQ.findMany({
      where: { businessId: businessProfile.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllRfqs() {
    return this.prisma.businessRFQ.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        businessProfile: {
          include: {
            user: { select: { email: true, name: true, phone: true } },
          },
        },
      },
    });
  }

  async updateRfqStatus(id: string, status: any, adminNotes?: string) {
    const rfq = await this.prisma.businessRFQ.findUnique({ where: { id } });
    if (!rfq) throw new NotFoundException('RFQ not found');

    return this.prisma.businessRFQ.update({
      where: { id },
      data: {
        status,
        ...(adminNotes !== undefined && { adminNotes }),
      },
    });
  }
}
