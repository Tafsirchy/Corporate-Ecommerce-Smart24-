import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2022-11-15' as any,
    });
  }

  async createPaymentIntent(
    amount: number,
    currency: string = 'bdt',
    orderId: string,
  ) {
    return this.stripe.paymentIntents.create({
      amount: amount * 100, // Stripe expects amount in smallest currency unit (poisha/cents)
      currency,
      metadata: { orderId },
    });
  }

  constructEventFromPayload(signature: string, payload: Buffer) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('Stripe webhook secret is not set');
    }
    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );
  }
}
