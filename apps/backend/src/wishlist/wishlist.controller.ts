import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Wishlist')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'wishlist', version: '1' })
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user wishlist' })
  getWishlist(@Req() req: any) {
    return this.wishlistService.getWishlist(req.user.id);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add item to wishlist' })
  addItem(
    @Req() req: any,
    @Body() body: { productId: string }
  ) {
    return this.wishlistService.addItem(req.user.id, body.productId);
  }

  @Delete('items/:productId')
  @ApiOperation({ summary: 'Remove item from wishlist' })
  removeItem(@Req() req: any, @Param('productId') productId: string) {
    return this.wishlistService.removeItem(req.user.id, productId);
  }

  @Post('merge')
  @ApiOperation({ summary: 'Merge local wishlist with server wishlist on login' })
  mergeWishlist(
    @Req() req: any,
    @Body() body: { productIds: string[] }
  ) {
    return this.wishlistService.mergeWishlist(req.user.id, body.productIds);
  }
}
