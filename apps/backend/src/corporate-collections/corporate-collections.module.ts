import { Module } from '@nestjs/common';
import { CorporateCollectionsController } from './corporate-collections.controller';
import { CorporateCollectionsService } from './corporate-collections.service';

@Module({
  controllers: [CorporateCollectionsController],
  providers: [CorporateCollectionsService]
})
export class CorporateCollectionsModule {}
