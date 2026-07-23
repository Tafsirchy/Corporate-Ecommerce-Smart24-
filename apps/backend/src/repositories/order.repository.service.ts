import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, OrderStatus, PaymentStatus } from '@prisma/client';

@Injectable()
export class OrderRepositoryService {
  constructor(private prisma: PrismaService) {}

  async createOrder(data: Prisma.OrderCreateInput) {
    return this.prisma.order.create({
      data,
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });
  }

  async findOrdersByUser(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findAllOrders() {
    return this.prisma.order.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        items: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOrderById(id: string) {
    return this.prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        items: {
          include: { product: true }
        }
      }
    });
  }

  async updateOrderStatus(id: string, status: any) {
    return this.prisma.order.update({
      where: { id },
      data: { status }
    });
  }

  async cancelOrder(id: string, reason: string) {
    return this.prisma.order.update({
      where: { id },
      data: { 
        status: 'CANCELLED',
        cancellationReason: reason
      }
    });
  }

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus) {
    return this.prisma.order.update({
      where: { id },
      data: { paymentStatus }
    });
  }
}
