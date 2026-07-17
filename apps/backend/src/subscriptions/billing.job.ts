import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SubscriptionRepository } from '../repositories/subscription.repository.service';
import { OrderRepositoryService } from '../repositories/order.repository.service';
import { Resend } from 'resend';

@Injectable()
export class BillingJob {
  private readonly logger = new Logger(BillingJob.name);
  private resend: Resend;

  constructor(
    private readonly subscriptionRepo: SubscriptionRepository,
    private readonly orderRepo: OrderRepositoryService,
  ) {
    if (process.env.RESEND_API_KEY) {
      this.resend = new Resend(process.env.RESEND_API_KEY);
    }
  }

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

          const order = await this.orderRepo.createOrder({
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
          });

          // Calculate next delivery date (add 1 month)
          const nextDate = new Date(sub.nextDeliveryDate);
          nextDate.setMonth(nextDate.getMonth() + 1);

          // Update Subscription idempotency key and next date
          await this.subscriptionRepo.markSubscriptionAsBilled(sub.id, cycleKey, nextDate);

          this.logger.log(`Successfully generated Order ${order.id} for Subscription ${sub.id}`);

          // Send Invoice Email via Resend
          if (this.resend && sub.user.email) {
            await this.resend.emails.send({
              from: 'Smart24 Billing <onboarding@resend.dev>', // Replace with verified domain
              to: sub.user.email,
              subject: `Invoice for your Subscription (Order #${order.id})`,
              html: `
                <h2>Hello ${sub.user.name},</h2>
                <p>Your monthly subscription order has been generated.</p>
                <p><strong>Total Amount:</strong> ৳${sub.totalAmount}</p>
                <p>Please log in to your account to process the payment so we can prepare your delivery.</p>
                <p>Thank you for choosing Smart24!</p>
              `
            });
            this.logger.log(`Sent invoice email to ${sub.user.email}`);
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
