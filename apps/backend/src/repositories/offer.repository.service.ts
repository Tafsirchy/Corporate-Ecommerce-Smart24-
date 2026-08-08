import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Offer, Prisma } from '@prisma/client';

@Injectable()
export class OfferRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createOffer(data: Prisma.OfferCreateInput): Promise<Offer> {
    return this.prisma.offer.create({ data });
  }

  async findAllOffers(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.offer.findMany({
        where: { deletedAt: null },
        include: { plan: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.offer.count({ where: { deletedAt: null } }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findActiveAmountBasedOffers(): Promise<Offer[]> {
    const now = new Date();
    return this.prisma.offer.findMany({
      where: {
        type: 'AMOUNT_BASED',
        isActive: true,
        deletedAt: null,
        OR: [
          { startDate: null, endDate: null },
          { startDate: { lte: now }, endDate: { gte: now } },
          { startDate: { lte: now }, endDate: null },
          { startDate: null, endDate: { gte: now } },
        ],
      },
      orderBy: {
        priority: 'desc',
      },
    });
  }

  async findOfferById(id: string): Promise<Offer | null> {
    return this.prisma.offer.findUnique({
      where: { id },
      include: { plan: true },
    });
  }

  async updateOffer(id: string, data: Prisma.OfferUpdateInput): Promise<Offer> {
    return this.prisma.offer.update({ where: { id }, data });
  }

  async deleteOffer(id: string): Promise<Offer> {
    return this.prisma.offer.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }
}
