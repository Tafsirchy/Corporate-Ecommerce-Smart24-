import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { Resend } from 'resend';

@Injectable()
export class CartJobService {
  private readonly logger = new Logger(CartJobService.name);
  private resend: Resend;

  constructor(private prisma: PrismaService) {
    if (process.env.RESEND_API_KEY) {
      this.resend = new Resend(process.env.RESEND_API_KEY);
    }
  }

  // Run every hour to check for abandoned carts
  @Cron(CronExpression.EVERY_HOUR)
  async checkAbandonedCarts() {
    this.logger.log('Checking for abandoned carts...');

    // Find carts that haven't been updated in 24 hours, have items, and reminder hasn't been sent yet
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const abandonedCarts = await this.prisma.cart.findMany({
      where: {
        updatedAt: { lte: oneDayAgo },
        reminderCount: 0,
        items: { some: {} },
        user: { isNot: null } // We need a user with email to send to
      },
      include: {
        user: true,
        items: { include: { product: true } }
      }
    });

    for (const cart of abandonedCarts) {
      if (this.resend && cart.user?.email) {
        try {
          await this.resend.emails.send({
            from: 'Smart24 Reminder <onboarding@resend.dev>',
            to: cart.user.email,
            subject: 'Did you forget something?',
            html: `<p>Hi ${cart.user.name}, you left items in your cart. Come back and complete your purchase before they sell out!</p>`
          });

          await this.prisma.cart.update({
            where: { id: cart.id },
            data: {
              reminderCount: 1,
              lastReminderSentAt: new Date()
            }
          });
          this.logger.log(`Sent abandoned cart reminder to ${cart.user.email}`);
        } catch (error) {
          this.logger.error(`Failed to send reminder to ${cart.user.email}`, error);
        }
      }
    }
  }
}
