import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { OfferRepository } from '../repositories/offer.repository.service';
import { Prisma } from '@prisma/client';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';

@Injectable()
export class OffersService {
  constructor(private readonly offerRepository: OfferRepository) {}

  async createOffer(data: CreateOfferDto) {
    try {
      return await this.offerRepository.createOffer(data);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException('An offer for this subscription plan already exists.');
      }
      throw error;
    }
  }

  async getAllOffers(page?: string, limit?: string) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 10;
    return this.offerRepository.findAllOffers(pageNum, limitNum);
  }

  async getActiveAmountBasedOffers() {
    return this.offerRepository.findActiveAmountBasedOffers();
  }

  async getOfferById(id: string) {
    const offer = await this.offerRepository.findOfferById(id);
    if (!offer) throw new NotFoundException('Offer not found');
    return offer;
  }

  async updateOffer(id: string, data: UpdateOfferDto) {
    try {
      return await this.offerRepository.updateOffer(id, data);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException('An offer for this subscription plan already exists.');
      }
      throw error;
    }
  }

  async deleteOffer(id: string) {
    return this.offerRepository.deleteOffer(id);
  }
}
