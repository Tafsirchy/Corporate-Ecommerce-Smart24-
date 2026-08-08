import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import { ReturnsService } from './returns.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ReturnStatus, Role } from '@prisma/client';

@Controller('returns')
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createReturn(
    @Req() req: any,
    @Body()
    data: {
      orderId: string;
      orderItemId?: string;
      reason: string;
      comments?: string;
    },
  ) {
    return this.returnsService.createReturn(req.user.userId, data);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyReturns(@Req() req: any, @Query() query: any) {
    return this.returnsService.getUserReturns(req.user.userId, query);
  }
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getReturnById(@Req() req: any, @Param('id') id: string) {
    return this.returnsService.getReturnById(id, req.user.userId);
  }
  // Admin endpoint
  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getAllReturns(@Query() query: any) {
    return this.returnsService.getAllReturns(query);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateReturnStatus(
    @Param('id') id: string,
    @Body() data: { status: ReturnStatus; refundAmount?: number },
  ) {
    return this.returnsService.updateReturnStatus(
      id,
      data.status,
      data.refundAmount,
    );
  }
}
