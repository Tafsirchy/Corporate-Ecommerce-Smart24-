import { Global, Module } from '@nestjs/common';
import { UserRepository } from './user.repository.service';
import { CategoryRepository } from './category.repository.service';
import { BrandRepository } from './brand.repository.service';
import { ProductRepository } from './product.repository.service';

@Global()
@Module({
  providers: [
    UserRepository,
    CategoryRepository,
    BrandRepository,
    ProductRepository
  ],
  exports: [
    UserRepository,
    CategoryRepository,
    BrandRepository,
    ProductRepository
  ],
})
export class RepositoriesModule {}
