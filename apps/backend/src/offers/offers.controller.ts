import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Get('active')
  async getActiveAmountBasedOffers() {
    return this.offersService.getActiveAmountBasedOffers();
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getAllOffers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.offersService.getAllOffers(page, limit);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getOfferById(@Param('id') id: string) {
    return this.offersService.getOfferById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async createOffer(@Body() data: CreateOfferDto) {
    return this.offersService.createOffer(data);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateOffer(@Param('id') id: string, @Body() data: UpdateOfferDto) {
    return this.offersService.updateOffer(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async deleteOffer(@Param('id') id: string) {
    return this.offersService.deleteOffer(id);
  }
}
