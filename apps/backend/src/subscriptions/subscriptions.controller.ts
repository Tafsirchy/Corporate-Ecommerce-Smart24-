import { Controller, Post, Get, Body, Req, UseGuards, Patch, Param } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Subscriptions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ path: 'subscriptions', version: '1' })
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post('plans')
  @Roles(Role.ADMIN)
  createPlan(@Body() body: any) {
    return this.subscriptionsService.createPlan(body);
  }

  @Get('plans')
  getPlans() {
    return this.subscriptionsService.getAllPlans();
  }

  @Post()
  createCustomSubscription(@Req() req: any, @Body() body: any) {
    return this.subscriptionsService.createCustomSubscription(req.user.userId, body);
  }

  @Post('fixed')
  createFixedSubscription(@Req() req: any, @Body() body: any) {
    return this.subscriptionsService.createFixedSubscription(req.user.userId, body);
  }

  @Get('my-subscriptions')
  getMySubscriptions(@Req() req: any) {
    return this.subscriptionsService.getUserSubscriptions(req.user.userId);
  }

  @Get('admin/all')
  @Roles(Role.ADMIN)
  getAllSubscriptions() {
    return this.subscriptionsService.getAllSubscriptions();
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.subscriptionsService.updateStatus(id, status);
  }
}
