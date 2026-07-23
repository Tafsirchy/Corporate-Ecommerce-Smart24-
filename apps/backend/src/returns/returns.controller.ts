import { Controller, Post, Get, Body, UseGuards, Req, Patch, Param } from '@nestjs/common';
import { ReturnsService } from './returns.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReturnStatus } from '@prisma/client';

@Controller('returns')
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createReturn(@Req() req: any, @Body() data: { orderId: string, orderItemId?: string, reason: string, comments?: string }) {
    return this.returnsService.createReturn(req.user.userId, data);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyReturns(@Req() req: any) {
    return this.returnsService.getUserReturns(req.user.userId);
  }
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getReturnById(@Req() req: any, @Param('id') id: string) {
    return this.returnsService.getReturnById(id, req.user.userId);
  }
  // Admin endpoint
  @Patch(':id/status')
  async updateReturnStatus(
    @Param('id') id: string,
    @Body() data: { status: ReturnStatus, refundAmount?: number }
  ) {
    return this.returnsService.updateReturnStatus(id, data.status, data.refundAmount);
  }
}
