import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { OrderRepositoryService } from '../repositories/order.repository.service';
import { CartRepositoryService } from '../repositories/cart.repository.service';
import { ProductRepository } from '../repositories/product.repository.service';
import { StripeService } from '../stripe/stripe.service';
import { OrderStatus, PaymentMethod } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LoyaltyService } from '../loyalty/loyalty.service';

import { PaymentOptionRepository } from '../repositories/payment-option.repository.service';

@Injectable()
export class OrdersService {
  constructor(
    private orderRepo: OrderRepositoryService,
    private cartRepo: CartRepositoryService,
    private productRepo: ProductRepository,
    private stripeService: StripeService,
    private prisma: PrismaService,
    private paymentOptionRepo: PaymentOptionRepository,
    private loyaltyService: LoyaltyService
  ) { }

  async createOrderFromCart(userId: string, data: {
    shippingAddress: string;
    contactNumber: string;
    paymentMethod: PaymentMethod;
    paymentTrxId?: string;
    paymentProofUrl?: string;
    paymentAccountNumber?: string;
    promoCode?: string;
  }) {
    const cart = await this.cartRepo.getCartByUserId(userId);
    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    let totalAmount = 0;
    const orderItems: any[] = [];

    for (const item of cart.items) {
      // Validate stock
      if (item.product.stock < item.quantity) {
        throw new BadRequestException(`Insufficient stock for product ${item.product.name}`);
      }

      totalAmount += item.product.price * item.quantity;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        priceAtPurchase: item.product.price
      });
    }

    // Determine delivery charge based on simple logic for now
    const deliveryCharge = 100; // Fixed delivery charge logic
    
    let discountAmount = 0;
    let appliedCouponId: string | undefined;
    let appliedUserRewardId: string | undefined;

    if (data.promoCode) {
      const validation = await this.validatePromo(userId, data.promoCode, totalAmount);
      if (validation.valid) {
        discountAmount = validation.discountAmount;
        if (validation.type === 'COUPON') appliedCouponId = validation.couponId;
        if (validation.type === 'REWARD') appliedUserRewardId = validation.userRewardId;
      }
    }

    const grandTotal = totalAmount - discountAmount + deliveryCharge;

    const order = await this.prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          user: { connect: { id: userId } },
          totalAmount: grandTotal,
          deliveryCharge,
          discountAmount,
          couponId: appliedCouponId,
          userRewardId: appliedUserRewardId,
          shippingAddress: data.shippingAddress,
          contactNumber: data.contactNumber,
          paymentMethod: data.paymentMethod,
          paymentTrxId: data.paymentTrxId,
          paymentProofUrl: data.paymentProofUrl,
          items: {
            create: orderItems
          }
        }
      });

      // Deduct stock
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: item.product.stock - item.quantity }
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id }
      });

      // Update coupon or reward usage
      if (appliedCouponId) {
        await tx.coupon.update({
          where: { id: appliedCouponId },
          data: { currentUses: { increment: 1 } }
        });
      }
      if (appliedUserRewardId) {
        await tx.userReward.update({
          where: { id: appliedUserRewardId },
          data: { status: 'USED', usedAt: new Date() }
        });
      }

      return createdOrder;
    });

    let clientSecret: string | null = null;
    if (data.paymentMethod === 'STRIPE') {
      const paymentIntent = await this.stripeService.createPaymentIntent(grandTotal, 'bdt', order.id);
      clientSecret = paymentIntent.client_secret;
    } else if (data.paymentAccountNumber) {
      // Auto-save the payment option for non-STRIPE payments if an account number is provided
      const existing = await this.paymentOptionRepo.findByUserIdAndProviderAndAccountNumber(
        userId,
        data.paymentMethod,
        data.paymentAccountNumber
      );
      if (!existing) {
        await this.paymentOptionRepo.create({
          provider: data.paymentMethod,
          accountNumber: data.paymentAccountNumber,
          user: { connect: { id: userId } }
        });
      }
    }

    return { order, clientSecret };
  }

  async validatePromo(userId: string, promoCode: string, cartTotal: number) {
    if (!promoCode) {
      throw new BadRequestException('Promo code is required');
    }

    // 1. Check Coupon
    const coupon = await this.prisma.coupon.findUnique({ where: { code: promoCode } });
    if (coupon) {
      if (coupon.status !== 'ACTIVE') throw new BadRequestException('Coupon is inactive');
      if (coupon.usageLimit && coupon.currentUses >= coupon.usageLimit) throw new BadRequestException('Coupon usage limit reached');
      if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) throw new BadRequestException('Coupon has expired');
      if (coupon.minOrderAmount && cartTotal < coupon.minOrderAmount) throw new BadRequestException(`Minimum order amount of ৳${coupon.minOrderAmount} required`);
      
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

    // 2. Check UserReward
    const userReward = await this.prisma.userReward.findFirst({
      where: { userId, code: promoCode, status: 'AVAILABLE' },
      include: { reward: true }
    });

    if (userReward) {
      if (userReward.expiresAt && new Date(userReward.expiresAt) < new Date()) {
        throw new BadRequestException('Reward ticket has expired');
      }

      let discountAmount = 0;
      if (userReward.reward.type === 'COUPON' && userReward.reward.couponId) {
        const linkedCoupon = await this.prisma.coupon.findUnique({
          where: { id: userReward.reward.couponId }
        });

        if (linkedCoupon) {
          if (linkedCoupon.minOrderAmount && cartTotal < linkedCoupon.minOrderAmount) {
            throw new BadRequestException(`Minimum order amount of ৳${linkedCoupon.minOrderAmount} required for this ticket`);
          }
          if (linkedCoupon.discountType === 'PERCENTAGE') {
            discountAmount = (cartTotal * linkedCoupon.discountValue) / 100;
            if (linkedCoupon.maxDiscount && discountAmount > linkedCoupon.maxDiscount) {
              discountAmount = linkedCoupon.maxDiscount;
            }
          } else {
            discountAmount = linkedCoupon.discountValue;
          }
        }
      } else {
        throw new BadRequestException('This type of reward cannot be applied as a promo code');
      }

      discountAmount = Math.min(discountAmount, cartTotal);
      return { valid: true, type: 'REWARD', discountAmount, userRewardId: userReward.id };
    }

    throw new BadRequestException('Invalid promo code or ticket');
  }

  async getUserOrders(userId: string) {
    return this.orderRepo.findOrdersByUser(userId);
  }

  async getOrderDetails(userId: string, orderId: string, isAdmin: boolean) {
    const order = await this.orderRepo.findOrderById(orderId);
    if (!order) throw new NotFoundException('Order not found');

    if (!isAdmin && order.userId !== userId) {
      throw new NotFoundException('Order not found'); // Hide existence
    }

    return order;
  }

  async cancelOrder(userId: string, orderId: string, reason: string) {
    const order = await this.orderRepo.findOrderById(orderId);
    if (!order || order.userId !== userId) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== 'PENDING') {
      throw new BadRequestException('Only pending orders can be cancelled');
    }

    return this.orderRepo.cancelOrder(orderId, reason);
  }
  // Admin endpoints
  async getAllOrders() {
    return this.orderRepo.findAllOrders();
  }

  async updatePaymentStatus(orderId: string, status: any) {
    return this.orderRepo.updatePaymentStatus(orderId, status);
  }

  async updateOrderStatus(orderId: string, status: OrderStatus) {
    const order = await this.orderRepo.updateOrderStatus(orderId, status);
    
    // Loyalty Ecosystem Hook
    if (status === 'DELIVERED') {
      await this.loyaltyService.processOrderCompletion(orderId).catch(err => {
        console.error(`Failed to process loyalty for order ${orderId}:`, err);
      });
    }

    return order;
  }
}
