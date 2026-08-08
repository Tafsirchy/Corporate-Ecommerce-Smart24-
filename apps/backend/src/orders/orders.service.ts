import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { EmailService } from '../common/email/email.service';
import { OrderRepositoryService } from '../repositories/order.repository.service';
import { CartRepositoryService } from '../repositories/cart.repository.service';
import { ProductRepository } from '../repositories/product.repository.service';
import { StripeService } from '../stripe/stripe.service';
import { OrderStatus, PaymentMethod } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OrderCreatedEvent } from './events/order-created.event';

import { PaymentOptionRepository } from '../repositories/payment-option.repository.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { PricingService } from './pricing.service';

@Injectable()
export class OrdersService {
  constructor(
    private orderRepo: OrderRepositoryService,
    private cartRepo: CartRepositoryService,
    private productRepo: ProductRepository,
    private stripeService: StripeService,
    private prisma: PrismaService,
    private paymentOptionRepo: PaymentOptionRepository,
    private loyaltyService: LoyaltyService,
    private emailService: EmailService,
    private eventEmitter: EventEmitter2,
    private pricingService: PricingService,
  ) {}

  async createOrderFromCart(
    userId: string | undefined,
    sessionId: string | undefined,
    data: CreateOrderDto,
  ) {
    if (!userId && !sessionId) throw new BadRequestException('Session missing');
    if (!userId && !data.guestEmail)
      throw new BadRequestException('Guest email is required');

    const cart = await this.cartRepo.getCart(userId, sessionId);
    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const { totalAmount, deliveryCharge, orderItems } = await this.pricingService.calculateCartTotals(userId, cart.items);

    let grandTotal = totalAmount + deliveryCharge;
    let finalDiscountAmount = 0;
    let appliedCouponId: string | undefined;
    let appliedUserRewardId: string | undefined;

    const order = await this.prisma.$transaction(async (tx) => {
      let discountAmount = 0;
      if (data.promoCode) {
        if (!userId)
          throw new BadRequestException(
            'Promo codes are only available for registered users',
          );
        const validation = await this.pricingService.validatePromo(
          userId,
          data.promoCode,
          totalAmount,
          tx,
        );
        if (validation.valid) {
          discountAmount = validation.discountAmount;
          if (validation.type === 'COUPON')
            appliedCouponId = validation.couponId;
          if (validation.type === 'REWARD')
            appliedUserRewardId = validation.userRewardId;
        }
      }

      finalDiscountAmount = discountAmount;
      grandTotal = totalAmount - discountAmount + deliveryCharge;
      // Ensure NET_30 is only for BUSINESS users and check Credit Limit
      let businessProfileId: string | undefined;
      if (data.paymentMethod === 'NET_30') {
        if (!userId)
          throw new BadRequestException(
            'NET_30 requires an active business account',
          );
        const user = await tx.user.findUnique({
          where: { id: userId },
          include: { businessProfile: true },
        });
        if (user?.role !== 'BUSINESS' || !user.businessProfile) {
          throw new BadRequestException(
            'NET_30 is only available for verified business accounts',
          );
        }

        const availableCredit =
          user.businessProfile.creditLimit - user.businessProfile.usedCredit;
        if (grandTotal > availableCredit) {
          throw new BadRequestException(
            `Insufficient credit limit. Available: ৳${availableCredit}`,
          );
        }

        businessProfileId = user.businessProfile.id;

        // Increment used credit
        await tx.businessProfile.update({
          where: { id: businessProfileId },
          data: { usedCredit: { increment: grandTotal } },
        });
      }

      const createdOrder = await tx.order.create({
        data: {
          userId: userId || null,
          guestEmail: !userId ? data.guestEmail || null : null,
          guestName: !userId ? data.guestName || null : null,
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
            create: orderItems,
          },
        },
      });

      // Deduct stock safely with atomic concurrency check
      for (const item of cart.items) {
        const updateResult = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: { gte: item.quantity },
          },
          data: { stock: { decrement: item.quantity } },
        });

        if (updateResult.count === 0) {
          throw new BadRequestException(
            `Insufficient stock for product ${item.product.name} during checkout.`,
          );
        }
      }

      // Update coupon or reward usage
      if (appliedCouponId) {
        await tx.coupon.update({
          where: { id: appliedCouponId },
          data: { currentUses: { increment: 1 } },
        });
      }
      if (appliedUserRewardId) {
        await tx.userReward.update({
          where: { id: appliedUserRewardId },
          data: { status: 'USED', usedAt: new Date() },
        });
      }

      return createdOrder;
    });

    let clientSecret: string | null = null;
    if (data.paymentMethod === 'STRIPE') {
      const paymentIntent = await this.stripeService.createPaymentIntent(
        grandTotal,
        'bdt',
        order.id,
      );
      clientSecret = paymentIntent.client_secret;
    } else if (data.paymentAccountNumber && userId) {
      // Auto-save the payment option for non-STRIPE payments if an account number is provided
      const existing =
        await this.paymentOptionRepo.findByUserIdAndProviderAndAccountNumber(
          userId,
          data.paymentMethod,
          data.paymentAccountNumber,
        );
      if (!existing) {
        await this.paymentOptionRepo.create({
          provider: data.paymentMethod,
          accountNumber: data.paymentAccountNumber,
          user: { connect: { id: userId } },
        });
      }
    }

    // Emit event for post-checkout asynchronous processing
    this.eventEmitter.emit(
      'order.created',
      new OrderCreatedEvent(
        order,
        cart.id,
        userId,
        data.guestEmail,
        data.guestName,
      ),
    );

    // Auto-save address for registered users only, if requested
    if (userId && data.saveAddress === true) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      const existingAddress = await this.prisma.address.findFirst({
        where: { userId, address: data.shippingAddress },
      });
      if (!existingAddress) {
        await this.prisma.address.create({
          data: {
            userId,
            fullName: user?.name || data.guestName || 'User',
            address: data.shippingAddress,
            postcode: '0000',
            phone: data.contactNumber || '',
            label: 'HOME',
          },
        });
      }
    }

    return { order, clientSecret };
  }

  async validatePromo(
    userId: string | undefined,
    promoCode: string,
    cartTotal: number,
  ) {
    if (!userId)
      throw new BadRequestException(
        'Promo codes are only available for registered users',
      );
    if (!promoCode) {
      throw new BadRequestException('Promo code is required');
    }
    return this.pricingService.validatePromo(userId, promoCode, cartTotal);
  }

  async getUserOrders(userId: string, pageStr?: string, limitStr?: string) {
    if (!pageStr && !limitStr) {
      return this.orderRepo.findOrdersByUser(userId);
    }
    const page = pageStr ? parseInt(pageStr, 10) : 1;
    const limit = limitStr ? parseInt(limitStr, 10) : 20;
    const skip = (page - 1) * limit;

    const result = (await this.orderRepo.findOrdersByUser(
      userId,
      skip,
      limit,
    )) as { data: any[]; total: number };
    return {
      data: result.data,
      meta: {
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      },
    };
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
          cancellationReason: reason,
        },
      });

      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      // Refund NET_30 credit
      if (order.paymentMethod === 'NET_30' && order.userId) {
        const user = await tx.user.findUnique({
          where: { id: order.userId },
          include: { businessProfile: true },
        });
        if (user && user.businessProfile) {
          await tx.businessProfile.update({
            where: { id: user.businessProfile.id },
            data: { usedCredit: { decrement: order.totalAmount } },
          });
        }
        await tx.businessInvoice.updateMany({
          where: { orderId: order.id },
          data: { status: 'VOID' },
        });
      }

      return cancelled;
    });

    return updatedOrder;
  }
  // Admin endpoints
  async getAllOrders(pageStr?: string, limitStr?: string) {
    if (!pageStr && !limitStr) {
      return this.orderRepo.findAllOrders();
    }
    const page = pageStr ? parseInt(pageStr, 10) : 1;
    const limit = limitStr ? parseInt(limitStr, 10) : 20;
    const skip = (page - 1) * limit;

    const result = (await this.orderRepo.findAllOrders(skip, limit)) as {
      data: any[];
      total: number;
    };
    return {
      data: result.data,
      meta: {
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      },
    };
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
          data: { status },
        });

        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }

        // Refund NET_30 credit
        if (order.paymentMethod === 'NET_30' && order.userId) {
          const user = await tx.user.findUnique({
            where: { id: order.userId },
            include: { businessProfile: true },
          });
          if (user && user.businessProfile) {
            await tx.businessProfile.update({
              where: { id: user.businessProfile.id },
              data: { usedCredit: { decrement: order.totalAmount } },
            });
          }
          await tx.businessInvoice.updateMany({
            where: { orderId: order.id },
            data: { status: 'VOID' },
          });
        }

        return result;
      });
    } else {
      updatedOrder = await this.orderRepo.updateOrderStatus(orderId, status);
    }

    // Generate Invoice for NET_30 upon fulfillment processing
    if (
      status === 'PROCESSING' &&
      order.paymentMethod === 'NET_30' &&
      order.userId
    ) {
      const user = await this.prisma.user.findUnique({
        where: { id: order.userId },
        include: { businessProfile: true },
      });
      if (user && user.businessProfile) {
        const existingInvoice = await this.prisma.businessInvoice.findUnique({
          where: { orderId: order.id },
        });
        if (!existingInvoice) {
          await this.prisma.businessInvoice.create({
            data: {
              businessId: user.businessProfile.id,
              orderId: order.id,
              totalAmount: order.totalAmount,
              status: 'GENERATED',
            },
          });
        }
      }
    }

    // Send delivery email
    if (status === 'DELIVERED') {
      const orderData = await this.orderRepo.findOrderById(orderId);
      const email = orderData?.guestEmail || orderData?.user?.email;
      if (orderData && email) {
        this.emailService
          .sendOrderDeliveredEmail(email, orderId)
          .catch((err) => {
            console.error('Failed to send delivery email:', err);
          });
      }

      // Loyalty Ecosystem Hook
      await this.loyaltyService.processOrderCompletion(orderId).catch((err) => {
        console.error(`Failed to process loyalty for order ${orderId}:`, err);
      });
    }

    return updatedOrder;
  }
}
