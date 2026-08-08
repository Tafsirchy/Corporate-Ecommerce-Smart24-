import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PricingRuleService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, adminId: string) {
    return this.prisma.pricingRule.create({
      data: {
        ...data,
        updatedBy: adminId,
      },
    });
  }

  async findAll(query: { page?: number; limit?: number } = {}) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.pricingRule.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.pricingRule.count(),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const rule = await this.prisma.pricingRule.findUnique({ where: { id } });
    if (!rule) throw new NotFoundException('Pricing rule not found');
    return rule;
  }

  async update(id: string, data: any, adminId: string) {
    return this.prisma.pricingRule.update({
      where: { id },
      data: {
        ...data,
        updatedBy: adminId,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.pricingRule.delete({
      where: { id },
    });
  }
}
