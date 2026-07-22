import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WishlistRepositoryService {
  constructor(private prisma: PrismaService) {}

  async getWishlistByUserId(userId: string) {
    return this.prisma.wishlist.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  async createWishlistForUser(userId: string) {
    return this.prisma.wishlist.create({
      data: { userId },
    });
  }

  async addWishlistItem(wishlistId: string, productId: string) {
    return this.prisma.wishlistItem.upsert({
      where: {
        wishlistId_productId: {
          wishlistId,
          productId,
        },
      },
      update: {},
      create: {
        wishlistId,
        productId,
      },
    });
  }

  async removeWishlistItem(wishlistId: string, productId: string) {
    return this.prisma.wishlistItem.deleteMany({
      where: {
        wishlistId,
        productId,
      },
    });
  }
}
