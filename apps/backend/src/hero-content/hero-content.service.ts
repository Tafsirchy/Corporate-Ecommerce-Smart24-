import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HeroContentService {
  constructor(private prisma: PrismaService) {}

  async findAll(activeOnly: boolean = false) {
    if (activeOnly) {
      return this.prisma.heroContent.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      });
    }
    return this.prisma.heroContent.findMany({
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string) {
    const content = await this.prisma.heroContent.findUnique({
      where: { id },
    });
    if (!content) throw new NotFoundException('HeroContent not found');
    return content;
  }

  async create(data: any) {
    return this.prisma.heroContent.create({
      data,
    });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.heroContent.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.heroContent.delete({
      where: { id },
    });
  }
}
