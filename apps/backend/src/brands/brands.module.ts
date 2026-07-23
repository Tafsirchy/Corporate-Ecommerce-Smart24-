import { Module } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { BrandsController } from './brands.controller';
import { FollowedBrandsService } from './followed-brands.service';
import { FollowedBrandsController } from './followed-brands.controller';

@Module({
  controllers: [BrandsController, FollowedBrandsController],
  providers: [BrandsService, FollowedBrandsService],
})
export class BrandsModule {}
