import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UsePipes, ValidationPipe } from '@nestjs/common';
import { PricingRuleService } from './pricing-rule.service';
import { CreatePricingRuleDto } from './dto/create-pricing-rule.dto';
import { UpdatePricingRuleDto } from './dto/update-pricing-rule.dto';
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
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  create(@Req() req: any, @Body() createPricingRuleDto: CreatePricingRuleDto) {
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
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  update(@Req() req: any, @Param('id') id: string, @Body() updatePricingRuleDto: UpdatePricingRuleDto) {
    return this.pricingRuleService.update(id, updatePricingRuleDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pricingRuleService.remove(id);
  }
}
