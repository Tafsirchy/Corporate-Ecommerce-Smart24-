import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
@ApiTags('Wishlist')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'wishlist', version: '1' })
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user wishlist' })
  getWishlist(@CurrentUser() userId: string) {
    return this.wishlistService.getWishlist(userId);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add item to wishlist' })
  addItem(@CurrentUser() userId: string, @Body() body: { productId: string }) {
    return this.wishlistService.addItem(userId, body.productId);
  }

  @Delete('items/:productId')
  @ApiOperation({ summary: 'Remove item from wishlist' })
  removeItem(
    @CurrentUser() userId: string,
    @Param('productId') productId: string,
  ) {
    return this.wishlistService.removeItem(userId, productId);
  }

  @Post('merge')
  @ApiOperation({
    summary: 'Merge local wishlist with server wishlist on login',
  })
  mergeWishlist(
    @CurrentUser() userId: string,
    @Body() body: { productIds: string[] },
  ) {
    return this.wishlistService.mergeWishlist(userId, body.productIds);
  }
}
