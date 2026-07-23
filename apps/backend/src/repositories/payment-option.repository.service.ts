import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, SavedPaymentMethod } from '@prisma/client';

@Injectable()
export class PaymentOptionRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.SavedPaymentMethodCreateInput): Promise<SavedPaymentMethod> {
    return this.prisma.savedPaymentMethod.create({ data });
  }

  async findByUserId(userId: string): Promise<SavedPaymentMethod[]> {
    return this.prisma.savedPaymentMethod.findMany({ 
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id: string): Promise<SavedPaymentMethod | null> {
    return this.prisma.savedPaymentMethod.findUnique({ where: { id } });
  }

  async findByUserIdAndProviderAndAccountNumber(userId: string, provider: any, accountNumber: string): Promise<SavedPaymentMethod | null> {
    return this.prisma.savedPaymentMethod.findFirst({
      where: { userId, provider, accountNumber }
    });
  }

  async delete(id: string): Promise<SavedPaymentMethod> {
    return this.prisma.savedPaymentMethod.delete({ where: { id } });
  }
}
