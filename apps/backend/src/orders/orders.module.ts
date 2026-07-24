import { Module, forwardRef } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { StripeModule } from '../stripe/stripe.module';
import { LoyaltyModule } from '../loyalty/loyalty.module';

@Module({
  imports: [forwardRef(() => StripeModule), LoyaltyModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
