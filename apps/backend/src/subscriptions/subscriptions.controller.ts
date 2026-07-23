import { Controller, Post, Get, Body, Req, UseGuards, Patch, Param } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Subscriptions')
@ApiBearerAuth()
@Controller({ path: 'subscriptions', version: '1' })
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post('plans')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  createPlan(@Body() body: any) {
    return this.subscriptionsService.createPlan(body);
  }

  @Get('plans')
  getPlans() {
    return this.subscriptionsService.getAllPlans();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  createCustomSubscription(@Req() req: any, @Body() body: any) {
    return this.subscriptionsService.createCustomSubscription(req.user.id, body);
  }

  @Post('fixed')
  @UseGuards(JwtAuthGuard)
  createFixedSubscription(@Req() req: any, @Body() body: any) {
    return this.subscriptionsService.createFixedSubscription(req.user.id, body);
  }

  @Get('my-subscriptions')
  @UseGuards(JwtAuthGuard)
  getMySubscriptions(@Req() req: any) {
    return this.subscriptionsService.getUserSubscriptions(req.user.id);
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getAllSubscriptions() {
    return this.subscriptionsService.getAllSubscriptions();
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.subscriptionsService.updateStatus(id, status);
  }
}
