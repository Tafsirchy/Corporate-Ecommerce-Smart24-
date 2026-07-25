import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CartJobService } from './cart.job';

@Module({
  controllers: [CartController],
  providers: [CartService, CartJobService]
})
export class CartModule {}
