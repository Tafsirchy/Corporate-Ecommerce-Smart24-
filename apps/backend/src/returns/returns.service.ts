import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ReturnRepositoryService } from '../repositories/return.repository.service';
import { OrderRepositoryService } from '../repositories/order.repository.service';
import { ReturnStatus } from '@prisma/client';

@Injectable()
export class ReturnsService {
  constructor(
    private returnRepo: ReturnRepositoryService,
    private orderRepo: OrderRepositoryService,
  ) {}

  async createReturn(
    userId: string,
    data: {
      orderId: string;
      orderItemId?: string;
      reason: string;
      comments?: string;
    },
  ) {
    // Verify order exists and belongs to user
    const order = await this.orderRepo.findOrderById(data.orderId);
    if (!order || order.userId !== userId) {
      throw new NotFoundException('Order not found');
    }

    // Usually, we only allow returns if the order is DELIVERED
    if (order.status !== 'DELIVERED') {
      throw new BadRequestException(
        'Can only request return for delivered orders',
      );
    }

    return this.returnRepo.createReturn({
      user: { connect: { id: userId } },
      order: { connect: { id: data.orderId } },
      ...(data.orderItemId && {
        orderItem: { connect: { id: data.orderItemId } },
      }),
      reason: data.reason,
      comments: data.comments,
    });
  }

  async getUserReturns(userId: string, query: { page?: number; limit?: number } = {}) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.returnRepo.findReturnsByUser(userId, skip, limit),
      this.returnRepo.countReturnsByUser(userId),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getAllReturns(query: { page?: number; limit?: number } = {}) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.returnRepo.findAllReturns(skip, limit),
      this.returnRepo.countAllReturns(),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getReturnById(id: string, userId: string) {
    const returnReq = await this.returnRepo.findReturnById(id);
    if (!returnReq || returnReq.userId !== userId) {
      throw new NotFoundException('Return not found');
    }
    return returnReq;
  }

  async updateReturnStatus(
    id: string,
    status: ReturnStatus,
    refundAmount?: number,
  ) {
    return this.returnRepo.updateReturnStatus(id, status, refundAmount);
  }
}
