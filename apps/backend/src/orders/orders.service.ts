import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { OrderRepositoryService } from '../repositories/order.repository.service';
import { CartRepositoryService } from '../repositories/cart.repository.service';
import { ProductRepository } from '../repositories/product.repository.service';
import { StripeService } from '../stripe/stripe.service';
import { OrderStatus, PaymentMethod } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

import { PaymentOptionRepository } from '../repositories/payment-option.repository.service';

@Injectable()
export class OrdersService {
  constructor(
    private orderRepo: OrderRepositoryService,
    private cartRepo: CartRepositoryService,
    private productRepo: ProductRepository,
    private stripeService: StripeService,
    private prisma: PrismaService,
    private paymentOptionRepo: PaymentOptionRepository
  ) { }

  async createOrderFromCart(userId: string, data: {
    shippingAddress: string;
    contactNumber: string;
    paymentMethod: PaymentMethod;
    paymentTrxId?: string;
    paymentProofUrl?: string;
    paymentAccountNumber?: string;
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
    const grandTotal = totalAmount + deliveryCharge;

    const order = await this.prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          user: { connect: { id: userId } },
          totalAmount: grandTotal,
          deliveryCharge,
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
    return this.orderRepo.updateOrderStatus(orderId, status);
  }
}
