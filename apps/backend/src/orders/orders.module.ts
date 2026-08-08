import { Module, forwardRef } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { StripeModule } from '../stripe/stripe.module';
import { LoyaltyModule } from '../loyalty/loyalty.module';
import { OrderCreatedListener } from './listeners/order-created.listener';
import { PricingService } from './pricing.service';

@Module({
  imports: [forwardRef(() => StripeModule), LoyaltyModule],
  controllers: [OrdersController],
  providers: [OrdersService, PricingService, OrderCreatedListener],
  exports: [OrdersService],
})
export class OrdersModule {}
