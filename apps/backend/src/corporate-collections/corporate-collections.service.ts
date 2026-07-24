import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CorporateCollectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll() {
    return this.prisma.corporateCollection.findMany({
      orderBy: { position: 'asc' },
    });
  }

  async getActive() {
    return this.prisma.corporateCollection.findMany({
      where: { isActive: true },
      orderBy: { position: 'asc' },
    });
  }

  async getByPosition(position: number) {
    return this.prisma.corporateCollection.findUnique({
      where: { position },
    });
  }

  async upsertSlot(position: number, data: any) {
    return this.prisma.corporateCollection.upsert({
      where: { position },
      update: {
        title: data.title,
        subtitle: data.subtitle,
        buttonText: data.buttonText,
        imageUrl: data.imageUrl,
        targetUrl: data.targetUrl,
        isActive: data.isActive,
      },
      create: {
        title: data.title,
        subtitle: data.subtitle,
        buttonText: data.buttonText,
        imageUrl: data.imageUrl,
        targetUrl: data.targetUrl,
        isActive: data.isActive,
        position,
      },
    });
  }

  async deleteSlot(position: number) {
    return this.prisma.corporateCollection.delete({
      where: { position },
    });
  }
}
