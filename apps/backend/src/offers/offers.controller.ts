import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { OffersService } from './offers.service';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Get('active')
  async getActiveAmountBasedOffers() {
    return this.offersService.getActiveAmountBasedOffers();
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getAllOffers() {
    return this.offersService.getAllOffers();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getOfferById(@Param('id') id: string) {
    return this.offersService.getOfferById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async createOffer(@Body() data: Prisma.OfferCreateInput) {
    return this.offersService.createOffer(data);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async updateOffer(@Param('id') id: string, @Body() data: Prisma.OfferUpdateInput) {
    return this.offersService.updateOffer(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async deleteOffer(@Param('id') id: string) {
    return this.offersService.deleteOffer(id);
  }
}
