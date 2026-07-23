import { Module } from '@nestjs/common';
import { PaymentOptionsService } from './payment-options.service';
import { PaymentOptionsController } from './payment-options.controller';

@Module({
  controllers: [PaymentOptionsController],
  providers: [PaymentOptionsService],
  exports: [PaymentOptionsService]
})
export class PaymentOptionsModule {}
