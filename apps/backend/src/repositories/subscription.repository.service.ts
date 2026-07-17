import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Subscription, SubscriptionPlan, Prisma } from '@prisma/client';

@Injectable()
export class SubscriptionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createPlan(data: Prisma.SubscriptionPlanCreateInput): Promise<SubscriptionPlan> {
    return this.prisma.subscriptionPlan.create({ data });
  }

  async findAllPlans(): Promise<SubscriptionPlan[]> {
    return this.prisma.subscriptionPlan.findMany();
  }

  async createSubscription(data: Prisma.SubscriptionCreateInput): Promise<Subscription> {
    return this.prisma.subscription.create({
      data,
      include: { items: true, plan: true }
    });
  }

  async findSubscriptionsByUserId(userId: string): Promise<Subscription[]> {
    return this.prisma.subscription.findMany({
      where: { userId },
      include: { items: { include: { product: true } }, plan: true, orders: true }
    });
  }

  async findAllSubscriptions(): Promise<Subscription[]> {
    return this.prisma.subscription.findMany({
      include: { user: true, items: { include: { product: true } }, plan: true }
    });
  }

  async updateSubscriptionStatus(id: string, status: any): Promise<Subscription> {
    return this.prisma.subscription.update({
      where: { id },
      data: { status }
    });
  }

  async findDueSubscriptions(todayStr: string): Promise<Subscription[]> {
    // We fetch active subscriptions whose nextDeliveryDate is on or before today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    return this.prisma.subscription.findMany({
      where: {
        status: 'ACTIVE',
        nextDeliveryDate: {
          lte: endOfToday
        },
        OR: [
          { lastBilledCycle: { not: todayStr } },
          { lastBilledCycle: null }
        ]
      },
      include: {
        items: { include: { product: true } },
        user: true
      }
    });
  }

  async markSubscriptionAsBilled(id: string, cycle: string, nextDate: Date): Promise<Subscription> {
    return this.prisma.subscription.update({
      where: { id },
      data: {
        lastBilledCycle: cycle,
        nextDeliveryDate: nextDate
      }
    });
  }
}
