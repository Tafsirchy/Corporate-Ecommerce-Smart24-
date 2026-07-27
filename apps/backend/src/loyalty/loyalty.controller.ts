import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
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
    return this.loyaltyService.getUserLoyaltyData(req.user.id);
  }

  @Get('transactions')
  async getMyTransactions(@Request() req: any) {
    return this.loyaltyService.getTransactions(req.user.id);
  }

  @Get('rewards/available')
  async getAvailableRewards(@Request() req: any) {
    return this.loyaltyService.getAvailableRewards(req.user.id);
  }

  @Get('rewards/me')
  async getMyRewards(@Request() req: any) {
    return this.loyaltyService.getMyRewards(req.user.id);
  }

  @Post('rewards/:id/claim')
  async claimReward(@Request() req: any, @Param('id') id: string) {
    return this.loyaltyService.claimReward(req.user.id, id);
  }

  // --- Admin Routes ---

  @Get('admin/rewards')
  @Roles('ADMIN')
  async getAllLoyaltyRewards() {
    return this.loyaltyService.getAllLoyaltyRewards();
  }

  @Post('admin/rewards')
  @Roles('ADMIN')
  async createLoyaltyReward(@Body() data: CreateLoyaltyRewardDto) {
    return this.loyaltyService.createLoyaltyReward(data);
  }

  @Put('admin/rewards/:id')
  @Roles('ADMIN')
  async updateLoyaltyReward(@Param('id') id: string, @Body() data: UpdateLoyaltyRewardDto) {
    return this.loyaltyService.updateLoyaltyReward(id, data);
  }

  @Delete('admin/rewards/:id')
  @Roles('ADMIN')
  async deleteLoyaltyReward(@Param('id') id: string) {
    return this.loyaltyService.deleteLoyaltyReward(id);
  }
}
