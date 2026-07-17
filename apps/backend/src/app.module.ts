import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { RepositoriesModule } from './repositories/repositories.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { BrandsModule } from './brands/brands.module';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [PrismaModule, RepositoriesModule, AuthModule, UsersModule, CategoriesModule, BrandsModule, ProductsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
