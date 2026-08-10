import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Subscription, SubscriptionPlan, Prisma } from '@prisma/client';

@Injectable()
export class SubscriptionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createPlan(
    data: Prisma.SubscriptionPlanCreateInput,
  ): Promise<SubscriptionPlan> {
    return this.prisma.subscriptionPlan.create({ data });
  }

  async updatePlan(id: string, data: any): Promise<SubscriptionPlan> {
    return this.prisma.subscriptionPlan.update({
      where: { id },
      data,
    });
  }

  async togglePlanActive(
    id: string,
    isActive: boolean,
  ): Promise<SubscriptionPlan> {
    return this.prisma.subscriptionPlan.update({
      where: { id },
      data: { isActive },
    });
  }

  async findAllPlans(
    skip?: number,
    take?: number,
  ): Promise<SubscriptionPlan[]> {
    return this.prisma.subscriptionPlan.findMany({
      skip,
      take,
      include: { items: { include: { product: true } }, offer: true },
    });
  }

  async countAllPlans(): Promise<number> {
    return this.prisma.subscriptionPlan.count();
  }

  async findPlanById(id: string): Promise<SubscriptionPlan | null> {
    return this.prisma.subscriptionPlan.findUnique({
      where: { id },
      include: { items: { include: { product: true } }, offer: true },
    });
  }

  async createSubscription(
    data: Prisma.SubscriptionCreateInput,
  ): Promise<Subscription> {
    return this.prisma.subscription.create({
      data,
      include: { items: true, plan: true },
    });
  }

  async findSubscriptionsByUserId(
    userId: string,
    skip?: number,
    take?: number,
  ): Promise<Subscription[]> {
    return this.prisma.subscription.findMany({
      where: { userId },
      skip,
      take,
      include: {
        items: { include: { product: true } },
        plan: true,
        orders: true,
      },
    });
  }

  async countSubscriptionsByUserId(userId: string): Promise<number> {
    return this.prisma.subscription.count({ where: { userId } });
  }

  async findAllSubscriptions(
    skip?: number,
    take?: number,
  ): Promise<Subscription[]> {
    return this.prisma.subscription.findMany({
      skip,
      take,
      include: {
        user: true,
        items: { include: { product: true } },
        plan: true,
      },
    });
  }

  async countAllSubscriptions(): Promise<number> {
    return this.prisma.subscription.count();
  }

  async updateSubscriptionStatus(
    id: string,
    status: any,
  ): Promise<Subscription> {
    return this.prisma.subscription.update({
      where: { id },
      data: { status },
    });
  }

  async findDueSubscriptions(todayStr: string) {
    // We fetch active subscriptions whose nextDeliveryDate is on or before today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    return this.prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        nextDeliveryDate: {
          lte: endOfToday,
        },
        OR: [{ lastBilledCycle: { not: todayStr } }, { lastBilledCycle: null }],
      },
      include: {
        user: true,
        items: { include: { product: true } },
      },
    });
  }

  async markSubscriptionAsBilled(
    id: string,
    cycle: string,
    nextDate: Date,
  ): Promise<Subscription> {
    return this.prisma.subscription.update({
      where: { id },
      data: {
        lastBilledCycle: cycle,
        nextDeliveryDate: nextDate,
      },
    });
  }
}
