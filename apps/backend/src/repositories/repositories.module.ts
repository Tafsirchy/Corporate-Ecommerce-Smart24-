import { Global, Module } from '@nestjs/common';
import { UserRepository } from './user.repository.service';
import { CategoryRepository } from './category.repository.service';
import { BrandRepository } from './brand.repository.service';
import { ProductRepository } from './product.repository.service';
import { CartRepositoryService } from './cart.repository.service';
import { OrderRepositoryService } from './order.repository.service';
import { SubscriptionRepository } from './subscription.repository.service';
import { QuotationRepository } from './quotation.repository.service';

@Global()
@Module({
  providers: [
    UserRepository,
    CategoryRepository,
    BrandRepository,
    ProductRepository,
    CartRepositoryService,
    OrderRepositoryService,
    SubscriptionRepository,
    QuotationRepository
  ],
  exports: [
    UserRepository,
    CategoryRepository,
    BrandRepository,
    ProductRepository,
    CartRepositoryService,
    OrderRepositoryService,
    SubscriptionRepository,
    QuotationRepository
  ],
})
export class RepositoriesModule {}
