import { Module } from '@nestjs/common';
import { BulkOrderService } from './bulk-order.service';
import { BulkOrderController } from './bulk-order.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BulkOrderController],
  providers: [BulkOrderService],
})
export class BulkOrderModule {}
