import { Controller, Post, Get, Body, Req, UseGuards, Patch, Param } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import {
  CreateSubscriptionPlanDto,
  CreateCustomSubscriptionDto,
  CreateFixedSubscriptionDto,
  UpdateSubscriptionStatusDto
} from './dto/subscriptions.dto';

@ApiTags('Subscriptions')
@ApiBearerAuth()
@Controller({ path: 'subscriptions', version: '1' })
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post('plans')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  createPlan(@Body() body: CreateSubscriptionPlanDto) {
    return this.subscriptionsService.createPlan(body);
  }

  @Get('plans')
  getPlans() {
    return this.subscriptionsService.getAllPlans();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  createCustomSubscription(@Req() req: any, @Body() body: CreateCustomSubscriptionDto) {
    return this.subscriptionsService.createCustomSubscription(req.user.id, body);
  }

  @Post('fixed')
  @UseGuards(JwtAuthGuard)
  createFixedSubscription(@Req() req: any, @Body() body: CreateFixedSubscriptionDto) {
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
  @UseGuards(JwtAuthGuard)
  updateUserStatus(@Req() req: any, @Param('id') id: string, @Body() body: UpdateSubscriptionStatusDto) {
    return this.subscriptionsService.updateUserStatus(req.user.id, id, body.status);
  }

  @Patch('admin/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updateAdminStatus(@Param('id') id: string, @Body() body: UpdateSubscriptionStatusDto) {
    return this.subscriptionsService.updateStatus(id, body.status);
  }
}
