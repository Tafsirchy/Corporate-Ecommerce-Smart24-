import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { PartnershipsService } from './partnerships.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Partnerships')
@Controller('partnerships')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class PartnershipsController {
  constructor(private readonly partnershipsService: PartnershipsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new partner (Admin only)' })
  create(@Body() createPartnerDto: CreatePartnerDto) {
    return this.partnershipsService.create(createPartnerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all partners (Admin only)' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('industry') industry?: string,
    @Query('tier') tier?: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    return this.partnershipsService.findAll({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      industry,
      tier,
      activeOnly,
    });
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get partner details by slug (Admin only)' })
  findBySlug(@Param('slug') slug: string) {
    return this.partnershipsService.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get partner details by ID (Admin only)' })
  findOne(@Param('id') id: string) {
    return this.partnershipsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update partner details (Admin only)' })
  update(
    @Param('id') id: string,
    @Body() updatePartnerDto: UpdatePartnerDto,
  ) {
    return this.partnershipsService.update(id, updatePartnerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete partner (Admin only)' })
  remove(@Param('id') id: string) {
    return this.partnershipsService.remove(id);
  }
}

