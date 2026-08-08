import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { PricingRule } from '@prisma/client';

@Injectable()
export class PricingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly loyaltyService: LoyaltyService,
  ) {}

  async calculateCartTotals(
    userId: string | undefined,
    cartItems: { productId: string; quantity: number; product: { name: string; price: number; stock: number; categoryId?: string | null } }[],
  ) {
    let totalAmount = 0;
    let userTierDiscount = 0;
    let pricingRules: PricingRule[] = [];

    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { businessProfile: true },
      });
      if (user?.role === 'BUSINESS' && user.businessProfile) {
        const tier = user.businessProfile.membershipTier;
        if (tier === 'SILVER') userTierDiscount = 5;
        if (tier === 'GOLD') userTierDiscount = 10;
        if (tier === 'PLATINUM') userTierDiscount = 15;
        if (tier === 'DIAMOND') userTierDiscount = 20;

        const now = new Date();
        pricingRules = await this.prisma.pricingRule.findMany({
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
      }
    }

    const orderItems: any[] = [];
    for (const item of cartItems) {
      if (item.product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product ${item.product.name}`,
        );
      }

      let applicableDiscount = userTierDiscount;
      for (const rule of pricingRules) {
        if (
          !rule.categoryId ||
          rule.categoryId === (item.product as any).categoryId
        ) {
          if (rule.discountPercent > applicableDiscount) {
            applicableDiscount = rule.discountPercent;
          }
        }
      }

      const discountedPrice = item.product.price * (1 - applicableDiscount / 100);
      totalAmount += discountedPrice * item.quantity;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        priceAtPurchase: item.product.price,
      });
    }

    const deliveryCharge = 100;
    return { totalAmount, deliveryCharge, orderItems };
  }

  async validatePromo(
    userId: string,
    promoCode: string,
    cartTotal: number,
    txClient?: any,
  ) {
    const prismaClient = txClient || this.prisma;
    
    // Check if it's a Coupon
    const coupon = await prismaClient.coupon.findUnique({
      where: { code: promoCode },
    });

    if (coupon) {
      if (!coupon.isActive) throw new BadRequestException('Coupon is inactive');
      if (coupon.validUntil && coupon.validUntil < new Date()) {
        throw new BadRequestException('Coupon has expired');
      }
      if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
        throw new BadRequestException('Coupon usage limit reached');
      }
      if (coupon.minOrderAmount && cartTotal < coupon.minOrderAmount) {
        throw new BadRequestException(
          `Minimum order amount of ৳${coupon.minOrderAmount} required`,
        );
      }

      let discountAmount = 0;
      if (coupon.discountType === 'PERCENTAGE') {
        discountAmount = (cartTotal * coupon.discountValue) / 100;
        if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
          discountAmount = coupon.maxDiscount;
        }
      } else {
        discountAmount = coupon.discountValue;
      }

      discountAmount = Math.min(discountAmount, cartTotal);
      return { valid: true, type: 'COUPON', discountAmount, couponId: coupon.id };
    }

    // Check if it's a Reward Ticket
    const userReward = await prismaClient.userReward.findUnique({
      where: { ticketCode: promoCode },
      include: { reward: true },
    });

    if (userReward) {
      if (userReward.userId !== userId) {
        throw new BadRequestException('This ticket does not belong to you');
      }
      if (userReward.status !== 'ACTIVE') {
        throw new BadRequestException(`Ticket is ${userReward.status.toLowerCase()}`);
      }
      if (userReward.expiresAt < new Date()) {
        throw new BadRequestException('Ticket has expired');
      }

      let discountAmount = 0;
      if (userReward.reward.type === 'COUPON' && userReward.reward.couponId) {
        const linkedCoupon = await prismaClient.coupon.findUnique({
          where: { id: userReward.reward.couponId },
        });

        if (linkedCoupon) {
          if (
            linkedCoupon.minOrderAmount &&
            cartTotal < linkedCoupon.minOrderAmount
          ) {
            throw new BadRequestException(
              `Minimum order amount of ৳${linkedCoupon.minOrderAmount} required for this ticket`,
            );
          }
          if (linkedCoupon.discountType === 'PERCENTAGE') {
            discountAmount = (cartTotal * linkedCoupon.discountValue) / 100;
            if (
              linkedCoupon.maxDiscount &&
              discountAmount > linkedCoupon.maxDiscount
            ) {
              discountAmount = linkedCoupon.maxDiscount;
            }
          } else {
            discountAmount = linkedCoupon.discountValue;
          }
        }
      } else {
        throw new BadRequestException(
          'This type of reward cannot be applied as a promo code',
        );
      }

      discountAmount = Math.min(discountAmount, cartTotal);
      return {
        valid: true,
        type: 'REWARD',
        discountAmount,
        userRewardId: userReward.id,
      };
    }

    throw new BadRequestException('Invalid promo code or ticket');
  }
}
