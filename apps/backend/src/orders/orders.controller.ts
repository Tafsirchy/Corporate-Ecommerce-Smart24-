import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  Req,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  Role,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { CreateOrderDto } from './dto/create-order.dto';

@ApiTags('Orders')
@Controller({ path: 'orders', version: '1' })
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @ApiOperation({ summary: 'Create a new order from cart' })
  createOrder(@Req() req: any, @Body() body: CreateOrderDto) {
    const sessionId = req.headers['x-session-id'] as string;
    return this.ordersService.createOrderFromCart(
      req.user?.id,
      sessionId,
      body,
    );
  }

  @Post('validate-promo')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Validate a promo code (Coupon or Reward ticket)' })
  validatePromo(
    @Req() req: any,
    @Body('promoCode') promoCode: string,
    @Body('cartTotal') cartTotal: number,
  ) {
    return this.ordersService.validatePromo(
      req.user?.id || req.user?.userId || req.user?.sub,
      promoCode,
      cartTotal,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user orders (Admin sees all)' })
  getOrders(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    if (req.user.role === Role.ADMIN) {
      return this.ordersService.getAllOrders(page, limit);
    }
    return this.ordersService.getUserOrders(
      req.user?.id || req.user?.userId || req.user?.sub,
      page,
      limit,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order details' })
  getOrderDetails(@Req() req: any, @Param('id') id: string) {
    return this.ordersService.getOrderDetails(
      req.user?.id || req.user?.userId || req.user?.sub,
      id,
      req.user.role === Role.ADMIN,
    );
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel a pending order' })
  cancelOrder(
    @Req() req: any,
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    return this.ordersService.cancelOrder(
      req.user?.id || req.user?.userId || req.user?.sub,
      id,
      reason,
    );
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update order status (Admin only)' })
  updateOrderStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus,
  ) {
    return this.ordersService.updateOrderStatus(id, status);
  }

  @Patch(':id/payment-status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update payment status (Admin only)' })
  updatePaymentStatus(
    @Param('id') id: string,
    @Body('paymentStatus') paymentStatus: PaymentStatus,
  ) {
    return this.ordersService.updatePaymentStatus(id, paymentStatus);
  }
}
