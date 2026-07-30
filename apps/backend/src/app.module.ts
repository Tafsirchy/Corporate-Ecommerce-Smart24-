import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CacheModule, CacheInterceptor } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { RepositoriesModule } from './repositories/repositories.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { BrandsModule } from './brands/brands.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { StripeModule } from './stripe/stripe.module';
import { UploadModule } from './upload/upload.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { QuotationsModule } from './quotations/quotations.module';
import { BannersModule } from './banners/banners.module';
import { ReviewsModule } from './reviews/reviews.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { AddressesModule } from './addresses/addresses.module';
import { PaymentOptionsModule } from './payment-options/payment-options.module';
import { ReturnsModule } from './returns/returns.module';
import { SupportTicketsModule } from './support-tickets/support-tickets.module';
import { FaqsModule } from './faqs/faqs.module';
import { SettingsModule } from './settings/settings.module';
import { OffersModule } from './offers/offers.module';
import { BusinessCollectionsModule } from './business-collections/business-collections.module';
import { LoyaltyModule } from './loyalty/loyalty.module';
import { MembershipsModule } from './memberships/memberships.module';
import { RewardsModule } from './rewards/rewards.module';
import { FiltersModule } from './filters/filters.module';
import { BusinessModule } from './business/business.module';
import { RfqModule } from './rfq/rfq.module';
import { BulkOrderModule } from './bulk-order/bulk-order.module';
import { InvoiceModule } from './invoice/invoice.module';
import { ContractModule } from './contract/contract.module';
import { PricingRuleModule } from './pricing-rule/pricing-rule.module';
import { SavedListModule } from './saved-list/saved-list.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { HeroContentModule } from './hero-content/hero-content.module';
import { EmailModule } from './common/email/email.module';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      ttl: 60000, // 1 minute global cache
    }),
    EmailModule,
    PrismaModule,
    RepositoriesModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    BrandsModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    StripeModule,
    UploadModule,
    SubscriptionsModule,
    QuotationsModule,
    ScheduleModule.forRoot(),
    BannersModule,
    ReviewsModule,
    WishlistModule,
    AddressesModule,
    PaymentOptionsModule,
    ReturnsModule,
    SupportTicketsModule,
    FaqsModule,
    SettingsModule,
    OffersModule,
    BusinessCollectionsModule,
    LoyaltyModule,
    MembershipsModule,
    RewardsModule,
    FiltersModule,
    BusinessModule,
    RfqModule,
    BulkOrderModule,
    InvoiceModule,
    ContractModule,
    PricingRuleModule,
    SavedListModule,
    AuditLogModule,
    HeroContentModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule { }
