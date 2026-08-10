import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MembershipsService } from '../memberships/memberships.service';

@Injectable()
export class LoyaltyService {
  private readonly logger = new Logger(LoyaltyService.name);

  constructor(
    private prisma: PrismaService,
    private membershipService: MembershipsService,
  ) {}

  async processOrderCompletion(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: { include: { membership: true } } },
    });

    if (!order || order.status !== 'DELIVERED') return;

    // Prevent double processing if already earned points
    if (order.earnedPoints && order.earnedPoints > 0) return;

    const user = order.user;
    if (!user) return;

    // 1. Update Lifetime Spent
    const newLifetimeSpent = user.lifetimeSpent + order.totalAmount;

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lifetimeSpent: newLifetimeSpent },
    });

    // 2. Evaluate Membership (might upgrade)
    const currentMembership =
      await this.membershipService.evaluateUserMembership(user.id);

    // 3. Calculate Points
    // Default Rule: ৳100 = 1 point.
    const basePoints = order.totalAmount / 100;
    const multiplier = currentMembership
      ? currentMembership.pointMultiplier
      : 1.0;
    const earnedPoints = Math.floor(basePoints * multiplier);

    if (earnedPoints > 0) {
      // 4. Grant Points
      await this.prisma.user.update({
        where: { id: user.id },
        data: { rewardPoints: { increment: earnedPoints } },
      });

      await this.prisma.order.update({
        where: { id: orderId },
        data: { earnedPoints },
      });

      // 5. Create Transaction Record
      await this.prisma.rewardTransaction.create({
        data: {
          userId: user.id,
          earn: earnedPoints,
          redeem: 0,
          balance: user.rewardPoints + earnedPoints,
          reason: 'ORDER_EARN',
          orderId: order.id,
          description: `Earned points for Order #${order.id}`,
        },
      });

      this.logger.log(
        `Granted ${earnedPoints} points to user ${user.id} for order ${order.id}`,
      );
    }
  }

  async getUserLoyaltyData(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        lifetimeSpent: true,
        rewardPoints: true,
        membership: true,
      },
    });
    return user;
  }

  async getTransactions(
    userId: string,
    query: { page?: number; limit?: number } = {},
  ) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.rewardTransaction.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.rewardTransaction.count({ where: { userId } }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getAvailableRewards(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { membership: true },
    });

    const userPriority = user?.membership?.priority || 0;

    return this.prisma.loyaltyReward.findMany({
      where: {
        status: 'ACTIVE',
        minMembershipPriority: { lte: userPriority },
      },
      orderBy: { pointCost: 'asc' },
    });
  }

  async getMyRewards(
    userId: string,
    query: { page?: number; limit?: number } = {},
  ) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.userReward.findMany({
        where: { userId },
        skip,
        take: limit,
        include: { reward: true },
        orderBy: { claimedAt: 'desc' },
      }),
      this.prisma.userReward.count({ where: { userId } }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async claimReward(userId: string, rewardId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { membership: true },
    });

    const reward = await this.prisma.loyaltyReward.findUnique({
      where: { id: rewardId },
    });

    if (!user || !reward) throw new Error('Not found');
    if (reward.status !== 'ACTIVE') throw new Error('Reward is inactive');
    if (reward.minMembershipPriority > (user.membership?.priority || 0)) {
      throw new Error('Membership level too low');
    }

    return this.prisma.$transaction(async (tx) => {
      if (reward.claimType === 'POINT_REDEEM') {
        if (user.rewardPoints < reward.pointCost) {
          throw new Error('Not enough points');
        }

        // Deduct points
        await tx.user.update({
          where: { id: userId },
          data: { rewardPoints: { decrement: reward.pointCost } },
        });

        // Record transaction
        await tx.rewardTransaction.create({
          data: {
            userId,
            earn: 0,
            redeem: reward.pointCost,
            balance: user.rewardPoints - reward.pointCost,
            reason: 'REWARD_REDEEM',
            description: `Redeemed ${reward.title}`,
          },
        });
      }

      // Grant Reward
      const expiryDate = reward.expiryDays
        ? new Date(Date.now() + reward.expiryDays * 24 * 60 * 60 * 1000)
        : null;

      // Generate unique code if it's a coupon or ticket
      let code: string | null = null;
      if (reward.type === 'COUPON' || reward.type === 'TICKET') {
        code = `${reward.type.substring(0, 3)}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      }

      const userReward = await tx.userReward.create({
        data: {
          userId,
          rewardId,
          expiresAt: expiryDate,
          code,
        },
      });

      return userReward;
    });
  }

  // --- Admin Methods for Rewards ---

  async getAllLoyaltyRewards(query: { page?: number; limit?: number } = {}) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.loyaltyReward.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.loyaltyReward.count(),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async createLoyaltyReward(data: any) {
    return this.prisma.loyaltyReward.create({ data });
  }

  async updateLoyaltyReward(id: string, data: any) {
    return this.prisma.loyaltyReward.update({
      where: { id },
      data,
    });
  }

  async deleteLoyaltyReward(id: string) {
    return this.prisma.loyaltyReward.delete({
      where: { id },
    });
  }
}
