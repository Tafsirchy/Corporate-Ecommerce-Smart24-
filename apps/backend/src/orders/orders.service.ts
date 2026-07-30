import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Resend } from 'resend';
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
  private resend: Resend;

  constructor(
    private orderRepo: OrderRepositoryService,
    private cartRepo: CartRepositoryService,
    private productRepo: ProductRepository,
    private stripeService: StripeService,
    private prisma: PrismaService,
    private paymentOptionRepo: PaymentOptionRepository,
    private loyaltyService: LoyaltyService
  ) { 
    if (process.env.RESEND_API_KEY) {
      this.resend = new Resend(process.env.RESEND_API_KEY);
    }
  }

  async createOrderFromCart(userId: string | undefined, sessionId: string | undefined, data: {
    shippingAddress: string;
    contactNumber: string;
    saveAddress?: boolean;
    paymentMethod: PaymentMethod;
    paymentTrxId?: string;
    paymentProofUrl?: string;
    paymentAccountNumber?: string;
    promoCode?: string;
    guestEmail?: string;
    guestName?: string;
  }) {
    if (!userId && !sessionId) throw new BadRequestException('Session missing');
    if (!userId && !data.guestEmail) throw new BadRequestException('Guest email is required');

    const cart = await this.cartRepo.getCart(userId, sessionId);
    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    let totalAmount = 0;
    const orderItems: any[] = [];

    // Fetch tier discount if business
    let userTierDiscount = 0;
    let pricingRules: any[] = [];
    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { businessProfile: true }
      });
      if (user?.role === 'BUSINESS' && user.businessProfile) {
        const tier = user.businessProfile.membershipTier;
        if (tier === 'SILVER') userTierDiscount = 5;
        if (tier === 'GOLD') userTierDiscount = 10;
        if (tier === 'PLATINUM') userTierDiscount = 15;
        if (tier === 'DIAMOND') userTierDiscount = 20;
        
        // Fetch Dynamic Pricing Rules
        const now = new Date();
        pricingRules = await this.prisma.pricingRule.findMany({
          where: {
            effectiveFrom: { lte: now },
            OR: [{ effectiveTo: null }, { effectiveTo: { gte: now } }],
            AND: [
              { OR: [{ businessType: user.businessProfile.businessType }, { businessType: null }] },
              { OR: [{ verificationLevel: user.businessProfile.verificationLevel }, { verificationLevel: null }] }
            ]
          }
        });
      }
    }

    for (const item of cart.items) {
      // Validate stock
      if (item.product.stock < item.quantity) {
        throw new BadRequestException(`Insufficient stock for product ${item.product.name}`);
      }

      let applicableDiscount = userTierDiscount;
      for (const rule of pricingRules) {
        if (!rule.categoryId || rule.categoryId === (item.product as any).categoryId) {
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
        priceAtPurchase: item.product.price
      });
    }

    // Determine delivery charge based on simple logic for now
    const deliveryCharge = 100; // Fixed delivery charge logic
    
    let grandTotal = totalAmount + deliveryCharge;
    let finalDiscountAmount = 0;
    let appliedCouponId: string | undefined;
    let appliedUserRewardId: string | undefined;

    const order = await this.prisma.$transaction(async (tx) => {
      let discountAmount = 0;
      if (data.promoCode) {
        if (!userId) throw new BadRequestException('Promo codes are only available for registered users');
        const validation = await this.validatePromo(userId, data.promoCode, totalAmount, tx);
        if (validation.valid) {
          discountAmount = validation.discountAmount;
          if (validation.type === 'COUPON') appliedCouponId = validation.couponId;
          if (validation.type === 'REWARD') appliedUserRewardId = validation.userRewardId;
        }
      }

      finalDiscountAmount = discountAmount;
      grandTotal = totalAmount - discountAmount + deliveryCharge;
      // Ensure NET_30 is only for BUSINESS users and check Credit Limit
      let businessProfileId: string | undefined;
      if (data.paymentMethod === 'NET_30') {
        if (!userId) throw new BadRequestException('NET_30 requires an active business account');
        const user = await tx.user.findUnique({
          where: { id: userId },
          include: { businessProfile: true }
        });
        if (user?.role !== 'BUSINESS' || !user.businessProfile) {
          throw new BadRequestException('NET_30 is only available for verified business accounts');
        }
        
        const availableCredit = user.businessProfile.creditLimit - user.businessProfile.usedCredit;
        if (grandTotal > availableCredit) {
          throw new BadRequestException(`Insufficient credit limit. Available: ৳${availableCredit}`);
        }
        
        businessProfileId = user.businessProfile.id;
        
        // Increment used credit
        await tx.businessProfile.update({
          where: { id: businessProfileId },
          data: { usedCredit: { increment: grandTotal } }
        });
      }

      const createdOrder = await tx.order.create({
        data: {
          userId: userId || null,
          guestEmail: !userId ? (data.guestEmail || null) : null,
          guestName: !userId ? (data.guestName || null) : null,
          totalAmount: grandTotal,
          deliveryCharge,
          discountAmount,
          couponId: appliedCouponId || null,
          userRewardId: appliedUserRewardId || null,
          shippingAddress: data.shippingAddress,
          contactNumber: data.contactNumber,
          paymentMethod: data.paymentMethod,
          paymentTrxId: data.paymentTrxId || null,
          paymentProofUrl: data.paymentProofUrl || null,
          items: {
            create: orderItems
          }
        }
      });



      // Deduct stock
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
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
    } else if (data.paymentAccountNumber && userId) {
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

    if (this.resend) {
      let emailToSendTo = data.guestEmail;
      let userName = data.guestName || 'Guest';
      
      if (userId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (user && user.email) {
          emailToSendTo = user.email;
          userName = user.name || 'User';
        }
      }

      if (emailToSendTo) {
        await this.resend.emails.send({
          from: 'Smart24 Orders <onboarding@resend.dev>',
          to: emailToSendTo,
          subject: `Order Confirmation - ${order.id}`,
          html: `<p>Thank you for your order, ${userName}! Your total is ৳${grandTotal}. We are processing it now.</p>`
        }).catch(err => console.error('Email error:', err));
      }

      // Auto-save address for registered users only, if requested
      if (userId && data.saveAddress === true) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        const existingAddress = await this.prisma.address.findFirst({
          where: { userId, address: data.shippingAddress }
        });
        if (!existingAddress) {
          await this.prisma.address.create({
            data: {
              userId,
              fullName: userName,
              address: data.shippingAddress,
              postcode: '0000',
              phone: data.contactNumber || '',
              label: 'HOME'
            }
          });
        }
      }
    }

    return { order, clientSecret };
  }

  async validatePromo(userId: string | undefined, promoCode: string, cartTotal: number, txClient?: any) {
    if (!userId) throw new BadRequestException('Promo codes are only available for registered users');
    if (!promoCode) {
      throw new BadRequestException('Promo code is required');
    }

    const prismaClient = txClient || this.prisma;

    // 1. Check Coupon
    const coupon = await prismaClient.coupon.findFirst({ 
      where: { code: { equals: promoCode, mode: 'insensitive' } } 
    });
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
    const userReward = await prismaClient.userReward.findFirst({
      where: { userId, code: { equals: promoCode, mode: 'insensitive' }, status: 'AVAILABLE' },
      include: { reward: true }
    });

    if (userReward) {
      if (userReward.expiresAt && new Date(userReward.expiresAt) < new Date()) {
        throw new BadRequestException('Reward ticket has expired');
      }

      let discountAmount = 0;
      if (userReward.reward.type === 'COUPON' && userReward.reward.couponId) {
        const linkedCoupon = await prismaClient.coupon.findUnique({
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

    const updatedOrder = await this.prisma.$transaction(async (tx) => {
      const cancelled = await tx.order.update({
        where: { id: orderId },
        data: { 
          status: 'CANCELLED',
          cancellationReason: reason
        }
      });
      
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } }
        });
      }
      
      // Refund NET_30 credit
      if (order.paymentMethod === 'NET_30' && order.userId) {
        const user = await tx.user.findUnique({
          where: { id: order.userId },
          include: { businessProfile: true }
        });
        if (user && user.businessProfile) {
          await tx.businessProfile.update({
            where: { id: user.businessProfile.id },
            data: { usedCredit: { decrement: order.totalAmount } }
          });
        }
        await tx.businessInvoice.updateMany({
          where: { orderId: order.id },
          data: { status: 'VOID' }
        });
      }
      
      return cancelled;
    });

    return updatedOrder;
  }
  // Admin endpoints
  async getAllOrders() {
    return this.orderRepo.findAllOrders();
  }

  async updatePaymentStatus(orderId: string, status: any) {
    return this.orderRepo.updatePaymentStatus(orderId, status);
  }

  async updateOrderStatus(orderId: string, status: OrderStatus) {
    const order = await this.orderRepo.findOrderById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const isCancelling = status === 'CANCELLED' && order.status !== 'CANCELLED';

    let updatedOrder;
    if (isCancelling) {
      updatedOrder = await this.prisma.$transaction(async (tx) => {
        const result = await tx.order.update({
          where: { id: orderId },
          data: { status }
        });
        
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } }
          });
        }
        
        // Refund NET_30 credit
        if (order.paymentMethod === 'NET_30' && order.userId) {
          const user = await tx.user.findUnique({
            where: { id: order.userId },
            include: { businessProfile: true }
          });
          if (user && user.businessProfile) {
            await tx.businessProfile.update({
              where: { id: user.businessProfile.id },
              data: { usedCredit: { decrement: order.totalAmount } }
            });
          }
          await tx.businessInvoice.updateMany({
            where: { orderId: order.id },
            data: { status: 'VOID' }
          });
        }
        
        return result;
      });
    } else {
      updatedOrder = await this.orderRepo.updateOrderStatus(orderId, status);
    }

    // Generate Invoice for NET_30 upon fulfillment processing
    if (status === 'PROCESSING' && order.paymentMethod === 'NET_30' && order.userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: order.userId },
        include: { businessProfile: true }
      });
      if (user && user.businessProfile) {
        const existingInvoice = await this.prisma.businessInvoice.findUnique({
          where: { orderId: order.id }
        });
        if (!existingInvoice) {
          await this.prisma.businessInvoice.create({
            data: {
              businessId: user.businessProfile.id,
              orderId: order.id,
              totalAmount: order.totalAmount,
              status: 'GENERATED'
            }
          });
        }
      }
    }
    
    // Send delivery email
    if (status === 'DELIVERED') {
      if (this.resend) {
        const orderData = await this.orderRepo.findOrderById(orderId);
        const email = orderData?.guestEmail || orderData?.user?.email;
        if (orderData && email) {
          await this.resend.emails.send({
             from: 'Smart24 Orders <onboarding@resend.dev>',
             to: email,
             subject: `Order Delivered - ${orderId}`,
             html: `<p>Your order ${orderId} has been delivered. Enjoy your products!</p>`
          }).catch(err => console.error('Email error:', err));
        }
      }

      // Loyalty Ecosystem Hook
      await this.loyaltyService.processOrderCompletion(orderId).catch(err => {
        console.error(`Failed to process loyalty for order ${orderId}:`, err);
      });
    }

    return order;
  }
}
