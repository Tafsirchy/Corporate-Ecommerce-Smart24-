import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CartRepositoryService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId?: string, sessionId?: string) {
    if (!userId && !sessionId) return null;
    return this.prisma.cart.findFirst({
      where: userId ? { userId } : { sessionId },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
                brand: true,
              },
            },
          },
        },
      },
    });
  }

  async createCart(userId?: string, sessionId?: string) {
    if (!userId && !sessionId)
      throw new Error('Must provide userId or sessionId');
    return this.prisma.cart.create({
      data: {
        userId: userId || null,
        sessionId: sessionId || null,
      },
      include: { items: true },
    });
  }

  async upsertCartItem(cartId: string, productId: string, quantity: number) {
    return this.prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId,
          productId,
        },
      },
      update: {
        quantity,
      },
      create: {
        cartId,
        productId,
        quantity,
      },
      include: {
        product: true,
      },
    });
  }

  async removeCartItem(cartId: string, productId: string) {
    return this.prisma.cartItem.delete({
      where: {
        cartId_productId: {
          cartId,
          productId,
        },
      },
    });
  }

  async clearCart(cartId: string) {
    return this.prisma.cartItem.deleteMany({
      where: { cartId },
    });
  }
}
