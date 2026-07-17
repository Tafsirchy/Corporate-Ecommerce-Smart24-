import { Module } from '@nestjs/common';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { BillingJob } from './billing.job';

@Module({
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, BillingJob],
})
export class SubscriptionsModule {}
