import { Module } from '@nestjs/common';
import { SavedListService } from './saved-list.service';
import { SavedListController } from './saved-list.controller';

import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SavedListController],
  providers: [SavedListService],
})
export class SavedListModule {}
