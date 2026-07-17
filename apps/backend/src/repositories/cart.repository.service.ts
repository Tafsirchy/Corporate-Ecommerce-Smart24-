import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CartRepositoryService {
  constructor(private prisma: PrismaService) {}

  async getCartByUserId(userId: string) {
    return this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
                brand: true,
              }
            }
          }
        }
      }
    });
  }

  async createCartForUser(userId: string) {
    return this.prisma.cart.create({
      data: { userId },
      include: { items: true }
    });
  }

  async upsertCartItem(cartId: string, productId: string, quantity: number) {
    return this.prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId,
          productId,
        }
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
        product: true
      }
    });
  }

  async removeCartItem(cartId: string, productId: string) {
    return this.prisma.cartItem.delete({
      where: {
        cartId_productId: {
          cartId,
          productId,
        }
      }
    });
  }

  async clearCart(cartId: string) {
    return this.prisma.cartItem.deleteMany({
      where: { cartId }
    });
  }
}
