import { Module } from '@nestjs/common';
import { PricingRuleService } from './pricing-rule.service';
import { PricingRuleController } from './pricing-rule.controller';

import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PricingRuleController],
  providers: [PricingRuleService],
})
export class PricingRuleModule {}
