import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HeroContentService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    activeOnly: boolean = false,
    query: { page?: number; limit?: number } = {},
  ) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where = activeOnly ? { isActive: true } : {};

    const [data, total] = await Promise.all([
      this.prisma.banner.findMany({
        where,
        skip,
        take: limit,
        orderBy: { order: 'asc' },
      }),
      this.prisma.banner.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const content = await this.prisma.banner.findUnique({
      where: { id },
    });
    if (!content) throw new NotFoundException('HeroContent not found');
    return content;
  }

  async create(data: any) {
    return this.prisma.banner.create({
      data,
    });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.banner.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.banner.delete({
      where: { id },
    });
  }
}
