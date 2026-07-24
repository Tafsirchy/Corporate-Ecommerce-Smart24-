import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RewardsService {
  constructor(private prisma: PrismaService) {}

  // Loyalty Rewards
  async getAllRewards() {
    return this.prisma.loyaltyReward.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async createReward(data: any) {
    return this.prisma.loyaltyReward.create({ data });
  }

  async updateReward(id: string, data: any) {
    return this.prisma.loyaltyReward.update({ where: { id }, data });
  }

  async deleteReward(id: string) {
    return this.prisma.loyaltyReward.delete({ where: { id } });
  }

  // Coupons
  async getAllCoupons() {
    return this.prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async createCoupon(data: any) {
    return this.prisma.coupon.create({ data });
  }

  async updateCoupon(id: string, data: any) {
    return this.prisma.coupon.update({ where: { id }, data });
  }

  async deleteCoupon(id: string) {
    return this.prisma.coupon.delete({ where: { id } });
  }
}
