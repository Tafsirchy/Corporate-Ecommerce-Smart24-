import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req, UsePipes, ValidationPipe } from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UpdateCartItemDto, MergeCartDto } from './dto/cart-item.dto';

@ApiTags('Cart')
@Controller({ path: 'cart', version: '1' })
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get current user or guest cart' })
  getCart(@Req() req: any) {
    const sessionId = req.headers['x-session-id'] as string;
    return this.cartService.getCart(req.user?.id, sessionId);
  }

  @Post('items')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Add or update item in cart' })
  @UsePipes(new ValidationPipe({ transform: true }))
  updateItem(
    @Req() req: any,
    @Body() body: UpdateCartItemDto
  ) {
    const sessionId = req.headers['x-session-id'] as string;
    return this.cartService.updateItem(req.user?.id, sessionId, body.productId, body.quantity);
  }

  @Delete('items/:productId')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Remove item from cart' })
  removeItem(@Req() req: any, @Param('productId') productId: string) {
    const sessionId = req.headers['x-session-id'] as string;
    return this.cartService.removeItem(req.user?.id, sessionId, productId);
  }

  @Post('merge')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Merge local cart with server cart on login' })
  @UsePipes(new ValidationPipe({ transform: true }))
  mergeCart(
    @Req() req: any,
    @Body() body: MergeCartDto
  ) {
    const sessionId = req.headers['x-session-id'] as string;
    return this.cartService.mergeCart(req.user.id, sessionId, body.items);
  }

  @Post('bulk')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Add multiple items to cart (e.g. from CSV bulk order)' })
  @UsePipes(new ValidationPipe({ transform: true }))
  addBulkItems(
    @Req() req: any,
    @Body() body: MergeCartDto // Using MergeCartDto because it's just { items: { productId, quantity }[] }
  ) {
    const sessionId = req.headers['x-session-id'] as string;
    return this.cartService.addBulkItems(req.user?.id, sessionId, body.items);
  }
}
