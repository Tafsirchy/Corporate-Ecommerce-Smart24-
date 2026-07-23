import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Offer, Prisma } from '@prisma/client';

@Injectable()
export class OfferRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createOffer(data: Prisma.OfferCreateInput): Promise<Offer> {
    return this.prisma.offer.create({ data });
  }

  async findAllOffers(): Promise<Offer[]> {
    return this.prisma.offer.findMany({
      include: { plan: true }
    });
  }

  async findActiveAmountBasedOffers(): Promise<Offer[]> {
    const now = new Date();
    return this.prisma.offer.findMany({
      where: {
        type: 'AMOUNT_BASED',
        isActive: true,
        OR: [
          { startDate: null, endDate: null },
          { startDate: { lte: now }, endDate: { gte: now } },
          { startDate: { lte: now }, endDate: null },
          { startDate: null, endDate: { gte: now } }
        ]
      },
      orderBy: {
        priority: 'desc'
      }
    });
  }

  async findOfferById(id: string): Promise<Offer | null> {
    return this.prisma.offer.findUnique({ where: { id }, include: { plan: true } });
  }

  async updateOffer(id: string, data: Prisma.OfferUpdateInput): Promise<Offer> {
    return this.prisma.offer.update({ where: { id }, data });
  }

  async deleteOffer(id: string): Promise<Offer> {
    return this.prisma.offer.delete({ where: { id } });
  }
}
