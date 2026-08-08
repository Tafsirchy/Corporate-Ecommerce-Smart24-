import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UseGuards,
  Patch,
  Param,
  Put,
  Query,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import {
  CreateSubscriptionPlanDto,
  UpdateSubscriptionPlanDto,
  CreateCustomSubscriptionDto,
  CreateFixedSubscriptionDto,
  UpdateSubscriptionStatusDto,
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
  getPlans(@Query() query: any) {
    return this.subscriptionsService.getAllPlans(query);
  }

  @Put('plans/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updatePlan(@Param('id') id: string, @Body() body: UpdateSubscriptionPlanDto) {
    return this.subscriptionsService.updatePlan(id, body);
  }

  @Patch('plans/:id/toggle-active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  togglePlanActive(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.subscriptionsService.togglePlanActive(id, isActive);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  createCustomSubscription(
    @Req() req: any,
    @Body() body: CreateCustomSubscriptionDto,
  ) {
    return this.subscriptionsService.createCustomSubscription(
      (req.user?.id || req.user?.userId || req.user?.sub),
      body,
    );
  }

  @Post('fixed')
  @UseGuards(JwtAuthGuard)
  createFixedSubscription(
    @Req() req: any,
    @Body() body: CreateFixedSubscriptionDto,
  ) {
    return this.subscriptionsService.createFixedSubscription((req.user?.id || req.user?.userId || req.user?.sub), body);
  }

  @Get('my-subscriptions')
  @UseGuards(JwtAuthGuard)
  getMySubscriptions(@Req() req: any, @Query() query: any) {
    return this.subscriptionsService.getUserSubscriptions((req.user?.id || req.user?.userId || req.user?.sub), query);
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getAllSubscriptions(@Query() query: any) {
    return this.subscriptionsService.getAllSubscriptions(query);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  updateUserStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: UpdateSubscriptionStatusDto,
  ) {
    return this.subscriptionsService.updateUserStatus(
      (req.user?.id || req.user?.userId || req.user?.sub),
      id,
      body.status,
    );
  }

  @Patch('admin/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updateAdminStatus(
    @Param('id') id: string,
    @Body() body: UpdateSubscriptionStatusDto,
  ) {
    return this.subscriptionsService.updateStatus(id, body.status);
  }
}
