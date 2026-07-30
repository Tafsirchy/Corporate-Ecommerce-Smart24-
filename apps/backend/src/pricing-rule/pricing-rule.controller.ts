import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { PricingRuleService } from './pricing-rule.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('pricing-rule')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class PricingRuleController {
  constructor(private readonly pricingRuleService: PricingRuleService) {}

  @Post()
  create(@Req() req: any, @Body() createPricingRuleDto: any) {
    return this.pricingRuleService.create(createPricingRuleDto, req.user.id);
  }

  @Get()
  findAll() {
    return this.pricingRuleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pricingRuleService.findOne(id);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() updatePricingRuleDto: any) {
    return this.pricingRuleService.update(id, updatePricingRuleDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pricingRuleService.remove(id);
  }
}
