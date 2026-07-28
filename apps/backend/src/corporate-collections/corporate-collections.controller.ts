import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { CorporateCollectionsService } from './corporate-collections.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpsertCorporateCollectionDto } from './dto/upsert-corporate-collection.dto';

@Controller('corporate-collections')
export class CorporateCollectionsController {
  constructor(private readonly service: CorporateCollectionsService) {}

  @Get()
  async getActiveCollections() {
    return this.service.getActive();
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async getAllCollections() {
    return this.service.getAll();
  }

  @Get(':position')
  async getCollectionByPosition(@Param('position', ParseIntPipe) position: number) {
    return this.service.getByPosition(position);
  }

  @Put(':position')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async upsertCollection(
    @Param('position', ParseIntPipe) position: number,
    @Body() data: UpsertCorporateCollectionDto,
  ) {
    return this.service.upsertSlot(position, data);
  }

  @Delete(':position')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async deleteCollection(@Param('position', ParseIntPipe) position: number) {
    return this.service.deleteSlot(position);
  }
}
