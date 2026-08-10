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
  Req,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product (Admin only)' })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all products (Admin only - includes inactive)',
  })
  findAllAdmin(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sort') sort?: string,
    @Query('categoryId') categoryId?: string,
    @Query('dynamicFilters') dynamicFilters?: string,
  ) {
    return this.productsService.findAll(
      page,
      limit,
      sort,
      undefined, // isFlashSale
      categoryId,
      dynamicFilters,
      undefined,
      undefined,
      undefined,
      undefined,
      true, // isAdmin
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all active products' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sort') sort?: string,
    @Query('isFlashSale') isFlashSale?: string,
    @Query('categoryId') categoryId?: string,
    @Query('dynamicFilters') dynamicFilters?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('rating') rating?: string,
    @Query('brands') brands?: string,
  ) {
    return this.productsService.findAll(
      page,
      limit,
      sort,
      isFlashSale,
      categoryId,
      dynamicFilters,
      minPrice,
      maxPrice,
      rating,
      brands,
      false, // isAdmin
    );
  }

  @Get('facets')
  @ApiOperation({ summary: 'Get faceted counts for filtering' })
  getFacets(
    @Query('categoryId') categoryId?: string,
    @Query('q') q?: string,
    @Query('dynamicFilters') dynamicFilters?: string,
  ) {
    return this.productsService.getFacetedCounts(categoryId, q, dynamicFilters);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search products by title, description, or category',
  })
  search(
    @Query('q') query: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('dynamicFilters') dynamicFilters?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('rating') rating?: string,
    @Query('brands') brands?: string,
  ) {
    if (!query || query.trim().length === 0) {
      return {
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
      };
    }
    return this.productsService.search(
      query.trim(),
      page,
      limit,
      dynamicFilters,
      minPrice,
      maxPrice,
      rating,
      brands,
    );
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get a product by slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post(':id/alert')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: 'Subscribe to back-in-stock alerts' })
  subscribeToAlert(
    @Param('id') id: string,
    @Body('email') email: string,
    @Req() req: any,
  ) {
    return this.productsService.subscribeToAlert(id, email, req.user?.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a product (Admin only)' })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a product (Admin only)' })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
