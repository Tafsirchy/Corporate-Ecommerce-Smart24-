import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { OrderCreatedEvent } from '../events/order-created.event';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../../common/email/email.service';

@Injectable()
export class OrderCreatedListener {
  private readonly logger = new Logger(OrderCreatedListener.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  @OnEvent('order.created')
  async handleOrderCreatedEvent(event: OrderCreatedEvent) {
    this.logger.log(
      `Handling order.created event for order: ${event.order.id}`,
    );

    // 1. Clear Cart
    try {
      await this.prisma.cartItem.deleteMany({
        where: { cartId: event.cartId },
      });
      this.logger.log(`Cart ${event.cartId} cleared successfully.`);
    } catch (error) {
      this.logger.error(`Failed to clear cart ${event.cartId}`, error);
    }

    // 2. Send Confirmation Email
    let emailToSendTo = event.guestEmail;
    let userName = event.guestName || 'Guest';

    if (event.userId) {
      try {
        const user = await this.prisma.user.findUnique({
          where: { id: event.userId },
        });
        if (user) {
          emailToSendTo = user.email;
          userName = user.name || 'User';
        }
      } catch (error) {
        this.logger.error(
          `Failed to fetch user ${event.userId} for email.`,
          error,
        );
      }
    }

    if (emailToSendTo) {
      try {
        await this.emailService.sendOrderConfirmationEmail(
          emailToSendTo,
          event.order.id,
          event.order.totalAmount,
          userName,
        );
        this.logger.log(`Order confirmation email sent to ${emailToSendTo}`);
      } catch (err) {
        this.logger.error(
          `Failed to send order confirmation email to ${emailToSendTo}`,
          err,
        );
      }
    }
  }
}
