import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CartRepositoryService } from '../repositories/cart.repository.service';
import { ProductRepository } from '../repositories/product.repository.service';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(
    private cartRepo: CartRepositoryService,
    private productRepo: ProductRepository,
    private prisma: PrismaService,
  ) {}

  async getCart(userId?: string, sessionId?: string) {
    if (!userId && !sessionId)
      throw new BadRequestException('Must provide userId or sessionId');
    let cart = await this.cartRepo.getCart(userId, sessionId);
    if (!cart) {
      try {
        await this.cartRepo.createCart(userId, sessionId);
      } catch (error) {
        console.error('Error creating cart:', error);
        // Ignore unique constraint violation if cart was created concurrently
      }
      cart = await this.cartRepo.getCart(userId, sessionId);
    }

    const cartToReturn = cart!;

    // Apply dynamic B2B discount if user is BUSINESS
    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { businessProfile: true },
      });

      if (user?.role === 'BUSINESS' && user.businessProfile) {
        // Base Tier Discount
        const tier = user.businessProfile.membershipTier;
        let tierDiscountPercent = 0;
        if (tier === 'SILVER') tierDiscountPercent = 5;
        if (tier === 'GOLD') tierDiscountPercent = 10;
        if (tier === 'PLATINUM') tierDiscountPercent = 15;
        if (tier === 'DIAMOND') tierDiscountPercent = 20;

        // Fetch Dynamic Pricing Rules
        const now = new Date();
        const pricingRules = await this.prisma.pricingRule.findMany({
          where: {
            effectiveFrom: { lte: now },
            OR: [{ effectiveTo: null }, { effectiveTo: { gte: now } }],
            AND: [
              {
                OR: [
                  { businessType: user.businessProfile.businessType },
                  { businessType: null },
                ],
              },
              {
                OR: [
                  { verificationLevel: user.businessProfile.verificationLevel },
                  { verificationLevel: null },
                ],
              },
            ],
          },
        });

        if (cartToReturn.items) {
          cartToReturn.items = cartToReturn.items.map((item) => {
            if (item.product) {
              let applicableDiscount = tierDiscountPercent;

              // Find if any specific rule applies to this product's category
              // Note: cart items product doesn't include categoryId by default in the cartRepo,
              // but we can check if it exists, or if there are global rules (categoryId: null)
              for (const rule of pricingRules) {
                // If the rule is global, or matches the product's category
                if (
                  !rule.categoryId ||
                  rule.categoryId === (item.product as any).categoryId
                ) {
                  if (rule.discountPercent > applicableDiscount) {
                    applicableDiscount = rule.discountPercent;
                  }
                }
              }

              if (applicableDiscount > 0) {
                const basePrice = item.product.price;
                item.product.discountPrice =
                  basePrice * (1 - applicableDiscount / 100);
              }
            }
            return item;
          });
        }
      }
    }

    return cartToReturn;
  }

  async updateItem(
    userId: string | undefined,
    sessionId: string | undefined,
    productId: string,
    quantity: number,
  ) {
    const product = await this.productRepo.findById(productId);
    if (!product) throw new NotFoundException('Product not found');

    // Check stock
    if (quantity > product.stock) {
      throw new BadRequestException(
        `Only ${product.stock} items left in stock`,
      );
    }

    const cart = await this.getCart(userId, sessionId);

    if (quantity <= 0) {
      return this.cartRepo.removeCartItem(cart.id, productId);
    }

    return this.cartRepo.upsertCartItem(cart.id, productId, quantity);
  }

  async removeItem(
    userId: string | undefined,
    sessionId: string | undefined,
    productId: string,
  ) {
    const cart = await this.getCart(userId, sessionId);
    return this.cartRepo.removeCartItem(cart.id, productId);
  }

  async mergeCart(
    userId: string,
    sessionId: string | undefined,
    items: { productId: string; quantity: number }[],
  ) {
    const cart = await this.getCart(userId);

    // Process items sequentially or with Promise.all
    for (const item of items) {
      const product = await this.productRepo.findById(item.productId);
      if (product) {
        // Find if it already exists to sum
        const existingItem = cart.items?.find(
          (i) => i.productId === item.productId,
        );
        const newQuantity = (existingItem?.quantity || 0) + item.quantity;
        const cappedQuantity = Math.min(
          newQuantity,
          product.stock || newQuantity,
        );

        await this.cartRepo.upsertCartItem(
          cart.id,
          item.productId,
          cappedQuantity,
        );
      }
    }

    // Also delete the guest cart if it exists
    if (sessionId) {
      const guestCart = await this.cartRepo.getCart(undefined, sessionId);
      if (guestCart) {
        await this.cartRepo.clearCart(guestCart.id);
        // Note: Prisma does not easily allow deleting the Cart record without breaking items if we don't clear items first
        // But since we did clearCart, we can delete the guest cart
        try {
          await this.cartRepo.deleteCart(guestCart.id);
        } catch (e) {
          console.error('Failed to delete guest cart', e);
        }
      }
    }

    return this.getCart(userId);
  }

  async addBulkItems(
    userId: string | undefined,
    sessionId: string | undefined,
    items: { productId: string; quantity: number }[],
  ) {
    const cart = await this.getCart(userId, sessionId);

    // Process items sequentially
    for (const item of items) {
      const product = await this.productRepo.findById(item.productId);
      if (product) {
        // Find if it already exists to sum
        const existingItem = cart.items?.find(
          (i) => i.productId === item.productId,
        );
        const newQuantity = (existingItem?.quantity || 0) + item.quantity;
        const cappedQuantity = Math.min(
          newQuantity,
          product.stock || newQuantity,
        );

        await this.cartRepo.upsertCartItem(
          cart.id,
          item.productId,
          cappedQuantity,
        );
      }
    }

    return this.getCart(userId, sessionId);
  }
}
