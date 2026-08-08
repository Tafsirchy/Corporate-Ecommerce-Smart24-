import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { HeroContentService } from './hero-content.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('hero-contents')
export class HeroContentController {
  constructor(private readonly heroContentService: HeroContentService) {}

  @Get()
  findAll(@Query() query: any) {
    const isActiveOnly = query.activeOnly === 'true';
    return this.heroContentService.findAll(isActiveOnly, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.heroContentService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() data: any) {
    return this.heroContentService.create(data);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() data: any) {
    return this.heroContentService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.heroContentService.remove(id);
  }
}
