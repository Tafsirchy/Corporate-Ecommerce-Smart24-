import {
  Controller,
  Post,
  Headers,
  Req,
  Res,
  HttpStatus,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { StripeService } from './stripe.service';
import type { Request, Response } from 'express';
import { OrdersService } from '../orders/orders.service';
import { OrderStatus } from '@prisma/client';

@Controller('stripe')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly ordersService: OrdersService,
  ) {}

  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
    @Res() res: Response,
  ) {
    if (!signature) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send('Missing stripe-signature header');
    }

    try {
      const event = this.stripeService.constructEventFromPayload(
        signature,
        req.rawBody as Buffer,
      );

      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object as any;
        const orderId = paymentIntent.metadata.orderId;

        if (orderId) {
          // Update order status to PROCESSING or PAID
          await this.ordersService.updateOrderStatus(
            orderId,
            OrderStatus.PROCESSING,
          );
        }
      }

      res.status(HttpStatus.OK).send();
    } catch (err: any) {
      console.error('Webhook Error:', err.message);
      res.status(HttpStatus.BAD_REQUEST).send(`Webhook Error: ${err.message}`);
    }
  }
}
