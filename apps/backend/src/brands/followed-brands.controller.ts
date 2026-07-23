import { Controller, Get, Post, Delete, Param, UseGuards, Req } from '@nestjs/common';
import { FollowedBrandsService } from './followed-brands.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Followed Brands')
@Controller('followed-brands')
export class FollowedBrandsController {
  constructor(private readonly followedBrandsService: FollowedBrandsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post(':brandId/follow')
  followBrand(@Req() req: any, @Param('brandId') brandId: string) {
    const userId = req.user?.id || req.user?.userId || req.user?.sub;
    return this.followedBrandsService.followBrand(userId, brandId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':brandId/follow')
  unfollowBrand(@Req() req: any, @Param('brandId') brandId: string) {
    const userId = req.user?.id || req.user?.userId || req.user?.sub;
    return this.followedBrandsService.unfollowBrand(userId, brandId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  getMyFollowedBrands(@Req() req: any) {
    const userId = req.user?.id || req.user?.userId || req.user?.sub;
    return this.followedBrandsService.getMyFollowedBrands(userId);
  }
}
