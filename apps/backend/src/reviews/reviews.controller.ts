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
  Query,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';

@ApiTags('Reviews')
@Controller({ path: 'reviews', version: '1' })
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  create(@Req() req, @Body() createReviewDto: CreateReviewDto) {
    const userId = req.user?.id || req.user?.userId || req.user?.sub;
    return this.reviewsService.create(userId, createReviewDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  findUserReviews(@Req() req, @Query() query: any) {
    const userId = req.user?.id || req.user?.userId || req.user?.sub;
    return this.reviewsService.findUserReviews(userId, query);
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
  findAllByProduct(@Param('productId') productId: string, @Query() query: any) {
    return this.reviewsService.findAllByProduct(productId, query);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch(':id')
  update(
    @Req() req,
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
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

  // --- Admin Endpoints ---

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @Get()
  findAllAdmin(@Query() query: any) {
    return this.reviewsService.findAllAdmin(query);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @Delete('admin/:id')
  removeAdmin(@Param('id') id: string) {
    return this.reviewsService.removeAdmin(id);
  }
}
