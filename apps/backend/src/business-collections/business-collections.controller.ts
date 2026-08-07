import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { BusinessCollectionsService } from './business-collections.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpsertBusinessCollectionDto } from './dto/upsert-business-collection.dto';

@Controller('business-collections')
export class BusinessCollectionsController {
  constructor(private readonly service: BusinessCollectionsService) {}

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
  async getCollectionByPosition(
    @Param('position', ParseIntPipe) position: number,
  ) {
    return this.service.getByPosition(position);
  }

  @Put(':position')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async upsertCollection(
    @Param('position', ParseIntPipe) position: number,
    @Body() data: UpsertBusinessCollectionDto,
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
