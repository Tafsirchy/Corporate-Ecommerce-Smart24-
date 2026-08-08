import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Quotation, Prisma } from '@prisma/client';

@Injectable()
export class QuotationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createQuotation(data: Prisma.QuotationCreateInput): Promise<Quotation> {
    return this.prisma.quotation.create({ data, include: { product: true } });
  }

  async findByUserId(userId: string): Promise<Quotation[]> {
    return this.prisma.quotation.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll(): Promise<Quotation[]> {
    return this.prisma.quotation.findMany({
      include: { user: true, product: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<Quotation | null> {
    return this.prisma.quotation.findUnique({
      where: { id },
    });
  }

  async updateStatus(
    id: string,
    data: Prisma.QuotationUpdateInput,
  ): Promise<Quotation> {
    return this.prisma.quotation.update({
      where: { id },
      data,
      include: { product: true, user: true },
    });
  }
}
