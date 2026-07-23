import { Injectable, NotFoundException } from '@nestjs/common';
import { OfferRepository } from '../repositories/offer.repository.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class OffersService {
  constructor(private readonly offerRepository: OfferRepository) {}

  async createOffer(data: Prisma.OfferCreateInput) {
    return this.offerRepository.createOffer(data);
  }

  async getAllOffers() {
    return this.offerRepository.findAllOffers();
  }

  async getActiveAmountBasedOffers() {
    return this.offerRepository.findActiveAmountBasedOffers();
  }

  async getOfferById(id: string) {
    const offer = await this.offerRepository.findOfferById(id);
    if (!offer) throw new NotFoundException('Offer not found');
    return offer;
  }

  async updateOffer(id: string, data: Prisma.OfferUpdateInput) {
    return this.offerRepository.updateOffer(id, data);
  }

  async deleteOffer(id: string) {
    return this.offerRepository.deleteOffer(id);
  }
}
