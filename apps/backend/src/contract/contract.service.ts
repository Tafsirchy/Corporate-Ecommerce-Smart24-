import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContractService {
  constructor(private prisma: PrismaService) {}

  async create(
    businessProfileId: string,
    contentUrl: string,
    validUntil?: Date,
  ) {
    return this.prisma.businessContract.create({
      data: {
        businessProfileId,
        contentUrl,
        type: 'GENERAL_AGREEMENT',
        validUntil,
        status: 'PENDING_SIGNATURE',
      },
    });
  }

  async findAllByBusiness(
    businessProfileId: string,
    query: { page?: number; limit?: number } = {},
  ) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.businessContract.findMany({
        where: { businessProfileId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.businessContract.count({ where: { businessProfileId } }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const contract = await this.prisma.businessContract.findUnique({
      where: { id },
      include: { businessProfile: true },
    });
    if (!contract) throw new NotFoundException('Contract not found');
    return contract;
  }

  async updateStatus(id: string, status: any) {
    return this.prisma.businessContract.update({
      where: { id },
      data: { status },
    });
  }

  // Admin endpoint
  async findAll(query: { page?: number; limit?: number } = {}) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.businessContract.findMany({
        skip,
        take: limit,
        include: { businessProfile: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.businessContract.count(),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
