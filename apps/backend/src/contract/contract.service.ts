import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContractService {
  constructor(private prisma: PrismaService) {}

  async create(businessProfileId: string, documentUrl: string, validUntil?: Date) {
    return this.prisma.businessContract.create({
      data: {
        businessProfileId,
        documentUrl,
        validUntil,
        status: 'PENDING',
      },
    });
  }

  async findAllByBusiness(businessProfileId: string) {
    return this.prisma.businessContract.findMany({
      where: { businessProfileId },
      orderBy: { createdAt: 'desc' },
    });
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
  async findAll() {
    return this.prisma.businessContract.findMany({
      include: { businessProfile: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
