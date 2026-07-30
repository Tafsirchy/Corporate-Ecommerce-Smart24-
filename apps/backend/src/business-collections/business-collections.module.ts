import { Module } from '@nestjs/common';
import { BusinessCollectionsController } from './business-collections.controller';
import { BusinessCollectionsService } from './business-collections.service';

@Module({
  controllers: [BusinessCollectionsController],
  providers: [BusinessCollectionsService]
})
export class BusinessCollectionsModule {}
