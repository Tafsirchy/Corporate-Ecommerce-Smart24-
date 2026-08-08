import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new category (Admin only)' })
  async create(@Body() createCategoryDto: CreateCategoryDto, @Req() req: any) {
    const category = await this.categoriesService.create(createCategoryDto);
    await this.auditLogService.create({
      adminId: (req.user?.id || req.user?.userId || req.user?.sub),
      action: 'CREATE',
      targetType: 'CATEGORY',
      targetId: category.id,
      reason: 'Created category ' + category.name,
    });
    return category;
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.categoriesService.findAll(page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a category by ID' })
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a category (Admin only)' })
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Req() req: any,
  ) {
    const category = await this.categoriesService.update(id, updateCategoryDto);
    await this.auditLogService.create({
      adminId: (req.user?.id || req.user?.userId || req.user?.sub),
      action: 'UPDATE',
      targetType: 'CATEGORY',
      targetId: category.id,
      reason: 'Updated category ' + category.name,
    });
    return category;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a category (Admin only)' })
  async remove(@Param('id') id: string, @Req() req: any) {
    const category = await this.categoriesService.remove(id);
    await this.auditLogService.create({
      adminId: (req.user?.id || req.user?.userId || req.user?.sub),
      action: 'DELETE',
      targetType: 'CATEGORY',
      targetId: category.id,
      reason: 'Deleted category ' + category.name,
    });
    return category;
  }
}
