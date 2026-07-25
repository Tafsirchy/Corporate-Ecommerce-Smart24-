import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { FiltersService } from './filters.service';
import { CreateFilterDto } from './dto/create-filter.dto';
import { UpdateFilterDto } from './dto/update-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Filters')
@Controller({ path: 'filters', version: '1' })
export class FiltersController {
  constructor(private readonly filtersService: FiltersService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new filter definition' })
  create(@Body() createFilterDto: CreateFilterDto) {
    return this.filtersService.create(createFilterDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active filter definitions' })
  findActive() {
    return this.filtersService.findActive();
  }

  @Get('admin/all')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all filter definitions (Admin)' })
  findAll() {
    return this.filtersService.findAll();
  }

  @Get('admin/suggested')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get suggested filter definitions (Admin)' })
  findSuggested() {
    return this.filtersService.findSuggested();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a filter definition by id' })
  findOne(@Param('id') id: string) {
    return this.filtersService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a filter definition' })
  update(@Param('id') id: string, @Body() updateFilterDto: UpdateFilterDto) {
    return this.filtersService.update(id, updateFilterDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a filter definition' })
  remove(@Param('id') id: string) {
    return this.filtersService.remove(id);
  }
}
