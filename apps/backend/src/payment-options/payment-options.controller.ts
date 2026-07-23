import { Controller, Get, Post, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { PaymentOptionsService } from './payment-options.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('payment-options')
export class PaymentOptionsController {
  constructor(private readonly paymentOptionsService: PaymentOptionsService) {}

  @Post()
  create(@Req() req: any, @Body() data: any) {
    return this.paymentOptionsService.create(req.user.id, data);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.paymentOptionsService.findByUserId(req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.paymentOptionsService.delete(id, req.user.id);
  }
}
