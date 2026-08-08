import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('rewards')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN') // All these are admin routes. User routes are in loyalty.controller
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  // Loyalty Rewards
  @Get('items')
  async getAllRewards() {
    return this.rewardsService.getAllRewards();
  }

  @Post('items')
  async createReward(@Body() data: any) {
    return this.rewardsService.createReward(data);
  }

  @Put('items/:id')
  async updateReward(@Param('id') id: string, @Body() data: any) {
    return this.rewardsService.updateReward(id, data);
  }

  @Delete('items/:id')
  async deleteReward(@Param('id') id: string) {
    return this.rewardsService.deleteReward(id);
  }

  // Coupons
  @Get('coupons')
  async getAllCoupons() {
    return this.rewardsService.getAllCoupons();
  }

  @Post('coupons')
  async createCoupon(@Body() data: any) {
    return this.rewardsService.createCoupon(data);
  }

  @Put('coupons/:id')
  async updateCoupon(@Param('id') id: string, @Body() data: any) {
    return this.rewardsService.updateCoupon(id, data);
  }

  @Delete('coupons/:id')
  async deleteCoupon(@Param('id') id: string) {
    return this.rewardsService.deleteCoupon(id);
  }
}
