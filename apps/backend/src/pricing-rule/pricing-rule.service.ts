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

  async findAll() {
    return this.prisma.pricingRule.findMany({
      orderBy: { createdAt: 'desc' },
    });
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
