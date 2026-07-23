import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Address } from '@prisma/client';

@Injectable()
export class AddressRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.AddressCreateInput): Promise<Address> {
    return this.prisma.address.create({ data });
  }

  async findByUserId(userId: string): Promise<Address[]> {
    return this.prisma.address.findMany({ 
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id: string): Promise<Address | null> {
    return this.prisma.address.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.AddressUpdateInput): Promise<Address> {
    return this.prisma.address.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Address> {
    return this.prisma.address.delete({ where: { id } });
  }

  async unsetDefaultShipping(userId: string): Promise<void> {
    await this.prisma.address.updateMany({
      where: { userId, isDefaultShipping: true },
      data: { isDefaultShipping: false }
    });
  }

  async unsetDefaultBilling(userId: string): Promise<void> {
    await this.prisma.address.updateMany({
      where: { userId, isDefaultBilling: true },
      data: { isDefaultBilling: false }
    });
  }
}
