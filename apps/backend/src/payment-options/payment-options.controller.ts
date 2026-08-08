import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PaymentOptionsService } from './payment-options.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('payment-options')
export class PaymentOptionsController {
  constructor(private readonly paymentOptionsService: PaymentOptionsService) {}

  @Post()
  create(@Req() req: any, @Body() data: any) {
    const userId = req.user?.id || req.user?.userId || req.user?.sub;
    return this.paymentOptionsService.create(userId, data);
  }

  @Get()
  findAll(@Req() req: any) {
    const userId = req.user?.id || req.user?.userId || req.user?.sub;
    return this.paymentOptionsService.findByUserId(userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id || req.user?.userId || req.user?.sub;
    return this.paymentOptionsService.delete(id, userId);
  }
}
