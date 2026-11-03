import { Module } from '@nestjs/common';
import { PartnershipsService } from './partnerships.service';
import { PartnershipsController } from './partnerships.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PartnershipsController],
  providers: [PartnershipsService],
  exports: [PartnershipsService],
})
export class PartnershipsModule {}

