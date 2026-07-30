import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BusinessCollectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll() {
    return this.prisma.businessCollection.findMany({
      orderBy: { position: 'asc' },
    });
  }

  async getActive() {
    return this.prisma.businessCollection.findMany({
      where: { isActive: true },
      orderBy: { position: 'asc' },
    });
  }

  async getByPosition(position: number) {
    return this.prisma.businessCollection.findUnique({
      where: { position },
    });
  }

  async upsertSlot(position: number, data: any) {
    return this.prisma.businessCollection.upsert({
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
    return this.prisma.businessCollection.delete({
      where: { position },
    });
  }
}
