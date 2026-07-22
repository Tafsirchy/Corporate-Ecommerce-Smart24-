import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req, UsePipes, ValidationPipe } from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UpdateCartItemDto, MergeCartDto } from './dto/cart-item.dto';

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
  @UsePipes(new ValidationPipe({ transform: true }))
  updateItem(
    @Req() req: any,
    @Body() body: UpdateCartItemDto
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
  @UsePipes(new ValidationPipe({ transform: true }))
  mergeCart(
    @Req() req: any,
    @Body() body: MergeCartDto
  ) {
    return this.cartService.mergeCart(req.user.id, body.items);
  }
}
