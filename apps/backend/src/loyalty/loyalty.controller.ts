import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Req,
  Query,
} from '@nestjs/common';
import { LoyaltyService } from './loyalty.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateLoyaltyRewardDto } from './dto/create-loyalty-reward.dto';
import { UpdateLoyaltyRewardDto } from './dto/update-loyalty-reward.dto';

@Controller('loyalty')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Get('me')
  async getMyLoyaltyData(@Request() req: any) {
    return this.loyaltyService.getUserLoyaltyData((req.user?.id || req.user?.userId || req.user?.sub));
  }

  @Get('transactions')
  getTransactions(@Req() req: any, @Query() query: any) {
    return this.loyaltyService.getTransactions((req.user?.id || req.user?.userId || req.user?.sub), query);
  }

  @Get('rewards/available')
  async getAvailableRewards(@Request() req: any) {
    return this.loyaltyService.getAvailableRewards((req.user?.id || req.user?.userId || req.user?.sub));
  }

  @Get('my-rewards')
  getMyRewards(@Req() req: any, @Query() query: any) {
    return this.loyaltyService.getMyRewards((req.user?.id || req.user?.userId || req.user?.sub), query);
  }

  @Post('rewards/:id/claim')
  async claimReward(@Request() req: any, @Param('id') id: string) {
    return this.loyaltyService.claimReward((req.user?.id || req.user?.userId || req.user?.sub), id);
  }

  // --- Admin Routes ---

  @Get('admin/rewards')
  @Roles('ADMIN')
  getAllLoyaltyRewards(@Query() query: any) {
    return this.loyaltyService.getAllLoyaltyRewards(query);
  }

  @Post('admin/rewards')
  @Roles('ADMIN')
  async createLoyaltyReward(@Body() data: CreateLoyaltyRewardDto) {
    return this.loyaltyService.createLoyaltyReward(data);
  }

  @Put('admin/rewards/:id')
  @Roles('ADMIN')
  async updateLoyaltyReward(
    @Param('id') id: string,
    @Body() data: UpdateLoyaltyRewardDto,
  ) {
    return this.loyaltyService.updateLoyaltyReward(id, data);
  }

  @Delete('admin/rewards/:id')
  @Roles('ADMIN')
  async deleteLoyaltyReward(@Param('id') id: string) {
    return this.loyaltyService.deleteLoyaltyReward(id);
  }
}
