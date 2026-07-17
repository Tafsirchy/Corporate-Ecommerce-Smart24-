import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'cart', version: '1' })
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user cart' })
  getCart(@Req() req: any) {
    return this.cartService.getCart(req.user.id);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add or update item in cart' })
  updateItem(
    @Req() req: any,
    @Body() body: { productId: string; quantity: number }
  ) {
    return this.cartService.updateItem(req.user.id, body.productId, body.quantity);
  }

  @Delete('items/:productId')
  @ApiOperation({ summary: 'Remove item from cart' })
  removeItem(@Req() req: any, @Param('productId') productId: string) {
    return this.cartService.removeItem(req.user.id, productId);
  }

  @Post('merge')
  @ApiOperation({ summary: 'Merge local cart with server cart on login' })
  mergeCart(
    @Req() req: any,
    @Body() body: { items: { productId: string; quantity: number }[] }
  ) {
    return this.cartService.mergeCart(req.user.id, body.items);
  }
}
