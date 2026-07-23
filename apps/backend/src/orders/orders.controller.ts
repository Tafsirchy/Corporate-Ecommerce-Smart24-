import { Controller, Get, Post, Body, Param, Patch, UseGuards, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ path: 'orders', version: '1' })
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order from cart' })
  createOrder(
    @Req() req: any,
    @Body() body: {
      shippingAddress: string;
      contactNumber: string;
      paymentMethod: PaymentMethod;
      paymentTrxId?: string;
      paymentProofUrl?: string;
      paymentAccountNumber?: string;
    }
  ) {
    return this.ordersService.createOrderFromCart(req.user.id, body);
  }

  @Get()
  @ApiOperation({ summary: 'Get user orders (Admin sees all)' })
  getOrders(@Req() req: any) {
    if (req.user.role === Role.ADMIN) {
      return this.ordersService.getAllOrders();
    }
    return this.ordersService.getUserOrders(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order details' })
  getOrderDetails(@Req() req: any, @Param('id') id: string) {
    return this.ordersService.getOrderDetails(req.user.id, id, req.user.role === Role.ADMIN);
  }

  @Patch(':id/status')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update order status (Admin only)' })
  updateOrderStatus(
    @Param('id') id: string,
    @Body('status') status: OrderStatus
  ) {
    return this.ordersService.updateOrderStatus(id, status);
  }

  @Patch(':id/payment-status')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update payment status (Admin only)' })
  updatePaymentStatus(
    @Param('id') id: string,
    @Body('paymentStatus') paymentStatus: PaymentStatus
  ) {
    return this.ordersService.updatePaymentStatus(id, paymentStatus);
  }
}
