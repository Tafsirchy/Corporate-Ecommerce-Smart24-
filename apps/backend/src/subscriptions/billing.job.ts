import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SubscriptionRepository } from '../repositories/subscription.repository.service';
import { OrderRepositoryService } from '../repositories/order.repository.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../common/email/email.service';

@Injectable()
export class BillingJob {
  private readonly logger = new Logger(BillingJob.name);

  constructor(
    private readonly subscriptionRepo: SubscriptionRepository,
    private readonly orderRepo: OrderRepositoryService,
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  // Runs every day at midnight
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleSubscriptionBilling() {
    this.logger.log('Starting daily subscription billing job...');
    const today = new Date();
    const cycleKey = `${today.getFullYear()}-${today.getMonth() + 1}`; // e.g., 2026-7

    try {
      // Find active subscriptions due today or earlier that haven't been billed this cycle
      const dueSubscriptions = await this.subscriptionRepo.findDueSubscriptions(cycleKey);
      this.logger.log(`Found ${dueSubscriptions.length} subscriptions to bill.`);

      for (const sub of dueSubscriptions) {
        try {
          // Idempotency check happens implicitly by querying with lastBilledCycle
          
          // Generate Order from Subscription
          const orderItems = sub.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            priceAtPurchase: item.product.price // Capture current price
          }));

          const nextDate = new Date(sub.nextDeliveryDate);
          nextDate.setMonth(nextDate.getMonth() + 1);

          const order = await this.prisma.$transaction(async (tx) => {
            const createdOrder = await tx.order.create({
              data: {
                user: { connect: { id: sub.userId } },
                subscription: { connect: { id: sub.id } },
                items: { create: orderItems },
                totalAmount: sub.totalAmount,
                deliveryCharge: 0, // Configurable later
                status: 'PENDING',
                paymentMethod: sub.paymentMethod,
                paymentStatus: 'PENDING',
                shippingAddress: sub.deliveryAddress,
                contactNumber: sub.contactNumber,
              }
            });

            await tx.subscription.update({
              where: { id: sub.id },
              data: {
                lastBilledCycle: cycleKey,
                nextDeliveryDate: nextDate
              }
            });

            return createdOrder;
          });

          this.logger.log(`Successfully generated Order ${order.id} for Subscription ${sub.id}`);

          // Send Invoice Email
          if (sub.user.email) {
            this.emailService.sendSubscriptionInvoiceEmail(sub.user.email, sub.user.name || 'User', order.id, sub.totalAmount).then(() => {
              this.logger.log(`Sent invoice email to ${sub.user.email}`);
            }).catch(err => {
              this.logger.error(`Failed to send invoice email to ${sub.user.email}: ${err.message}`);
            });
          }
        } catch (error) {
          this.logger.error(`Failed to process subscription ${sub.id}: ${error.message}`);
        }
      }
    } catch (error) {
      this.logger.error('Error fetching due subscriptions', error.stack);
    }
    
    this.logger.log('Finished daily subscription billing job.');
  }
}
