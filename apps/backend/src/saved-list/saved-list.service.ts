import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SavedListService {
  constructor(private prisma: PrismaService) {}

  async create(data: any, businessId: string) {
    return this.prisma.businessSavedList.create({
      data: {
        ...data,
        businessId
      }
    });
  }

  async findAllByBusiness(businessId: string) {
    return this.prisma.businessSavedList.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: string) {
    const list = await this.prisma.businessSavedList.findUnique({ where: { id } });
    if (!list) throw new NotFoundException('Saved list not found');
    return list;
  }

  async remove(id: string, businessId: string) {
    const list = await this.findOne(id);
    if (list.businessId !== businessId) {
      throw new NotFoundException('Saved list not found');
    }
    return this.prisma.businessSavedList.delete({
      where: { id }
    });
  }
}
