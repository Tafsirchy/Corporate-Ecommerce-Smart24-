import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReturnStatus } from '@prisma/client';

@Injectable()
export class ReturnRepositoryService {
  constructor(private prisma: PrismaService) {}

  async createReturn(data: any) {
    return this.prisma.returnRequest.create({
      data,
      include: {
        order: true,
        orderItem: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async findReturnsByUser(userId: string, skip?: number, take?: number) {
    return this.prisma.returnRequest.findMany({
      where: { userId },
      skip,
      take,
      include: {
        order: {
          select: { id: true, createdAt: true, status: true },
        },
        orderItem: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async countReturnsByUser(userId: string) {
    return this.prisma.returnRequest.count({ where: { userId } });
  }

  async findAllReturns(skip?: number, take?: number) {
    return this.prisma.returnRequest.findMany({
      skip,
      take,
      include: {
        order: {
          select: { id: true, createdAt: true, status: true },
        },
        orderItem: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async countAllReturns() {
    return this.prisma.returnRequest.count();
  }

  async findReturnById(id: string) {
    return this.prisma.returnRequest.findUnique({
      where: { id },
      include: {
        order: true,
        orderItem: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async updateReturnStatus(
    id: string,
    status: ReturnStatus,
    refundAmount?: number,
  ) {
    return this.prisma.returnRequest.update({
      where: { id },
      data: {
        status,
        ...(refundAmount !== undefined && { refundAmount }),
      },
    });
  }
}
