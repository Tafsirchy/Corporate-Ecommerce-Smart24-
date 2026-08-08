import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Reviews')
@Controller({ path: 'reviews', version: '1' })
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  create(@Req() req, @Body() createReviewDto: any) {
    const userId = req.user?.id || req.user?.userId || req.user?.sub;
    return this.reviewsService.create(userId, createReviewDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  findUserReviews(@Req() req) {
    const userId = req.user?.id || req.user?.userId || req.user?.sub;
    return this.reviewsService.findUserReviews(userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me/pending')
  findPendingReviews(@Req() req) {
    const userId = req.user?.id || req.user?.userId || req.user?.sub;
    return this.reviewsService.findPendingReviews(userId);
  }

  // Changed path to allow fetching by product ID
  @Get('product/:productId')
  findAllByProduct(@Param('productId') productId: string) {
    return this.reviewsService.findAllByProduct(productId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  update(@Req() req, @Param('id') id: string, @Body() updateReviewDto: any) {
    const userId = req.user?.id || req.user?.userId || req.user?.sub;
    return this.reviewsService.update(userId, id, updateReviewDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Req() req, @Param('id') id: string) {
    const userId = req.user?.id || req.user?.userId || req.user?.sub;
    return this.reviewsService.remove(userId, id);
  }
}
