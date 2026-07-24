import { Module } from '@nestjs/common';
import { MembershipsService } from './memberships.service';
import { MembershipsController } from './memberships.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [MembershipsService],
  controllers: [MembershipsController],
  exports: [MembershipsService]
})
export class MembershipsModule {}
