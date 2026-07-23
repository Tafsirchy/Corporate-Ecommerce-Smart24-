import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SubscriptionRepository } from '../repositories/subscription.repository.service';
import { ProductRepository } from '../repositories/product.repository.service';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly subscriptionRepo: SubscriptionRepository,
    private readonly productRepo: ProductRepository
  ) {}

  async createPlan(data: any) {
    const { name, description, price, items } = data;
    const planItems = items ? items.map((item: any) => ({
      product: { connect: { id: item.productId } },
      quantity: item.quantity
    })) : [];

    return this.subscriptionRepo.createPlan({
      name,
      description,
      price,
      items: { create: planItems }
    });
  }

  async getAllPlans() {
    return this.subscriptionRepo.findAllPlans();
  }

  async createCustomSubscription(userId: string, data: any) {
    // Basic validation
    if (!data.items || data.items.length < 2) {
      throw new BadRequestException('A custom subscription requires at least 2 items.');
    }

    let totalAmount = 0;
    const itemsData: { productId: string; quantity: number }[] = [];

    // Verify items and calculate price
    for (const item of data.items) {
      const product = await this.productRepo.findById(item.productId);
      if (!product) throw new NotFoundException(`Product ${item.productId} not found`);
      
      totalAmount += product.price * item.quantity;
      itemsData.push({
        productId: item.productId,
        quantity: item.quantity
      });
    }

    // Set next delivery date based on billing day
    const nextDelivery = new Date();
    nextDelivery.setDate(data.billingDay);
    if (nextDelivery < new Date()) {
      // If billing day for this month has passed, start next month
      nextDelivery.setMonth(nextDelivery.getMonth() + 1);
    }

    return this.subscriptionRepo.createSubscription({
      user: { connect: { id: userId } },
      items: { create: itemsData },
      totalAmount,
      deliveryAddress: data.deliveryAddress,
      contactNumber: data.contactNumber,
      billingDay: data.billingDay,
      nextDeliveryDate: nextDelivery,
      paymentMethod: data.paymentMethod || 'MANUAL',
      status: 'ACTIVE'
    });
  }

  async createFixedSubscription(userId: string, data: any) {
    const plan = await this.subscriptionRepo.findPlanById(data.planId);
    if (!plan) throw new NotFoundException('Subscription Plan not found');

    const nextDelivery = new Date();
    nextDelivery.setDate(data.billingDay);
    if (nextDelivery < new Date()) {
      nextDelivery.setMonth(nextDelivery.getMonth() + 1);
    }

    // Inherit items from plan
    // But Subscription has its own items, so we map plan items to subscription items
    // Since SubscriptionPlanItem is different from SubscriptionItem, we create them
    const itemsData = (plan as any).items.map((item: any) => ({
      productId: item.productId,
      quantity: item.quantity
    }));

    return this.subscriptionRepo.createSubscription({
      user: { connect: { id: userId } },
      plan: { connect: { id: plan.id } },
      items: { create: itemsData },
      totalAmount: plan.price,
      deliveryAddress: data.deliveryAddress,
      contactNumber: data.contactNumber,
      billingDay: data.billingDay,
      nextDeliveryDate: nextDelivery,
      paymentMethod: data.paymentMethod || 'MANUAL',
      status: 'ACTIVE'
    });
  }

  async getUserSubscriptions(userId: string) {
    return this.subscriptionRepo.findSubscriptionsByUserId(userId);
  }

  async getAllSubscriptions() {
    return this.subscriptionRepo.findAllSubscriptions();
  }

  async updateStatus(id: string, status: string) {
    return this.subscriptionRepo.updateSubscriptionStatus(id, status);
  }
}
