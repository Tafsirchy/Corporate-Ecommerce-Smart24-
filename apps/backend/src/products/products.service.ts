import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductRepository } from '../repositories/product.repository.service';
import { PrismaService } from '../prisma/prisma.service';
import slugify from 'slugify';

@Injectable()
export class ProductsService {
  constructor(
    private productRepository: ProductRepository,
    private prisma: PrismaService
  ) {}

  async create(createProductDto: CreateProductDto) {
    const slug = slugify(createProductDto.name, { lower: true, strict: true });
    
    const existing = await this.productRepository.findBySlug(slug);
    if (existing) {
      throw new ConflictException('Product with this name already exists');
    }

    return this.productRepository.create({
      name: createProductDto.name,
      slug,
      description: createProductDto.description,
      price: createProductDto.price,
      stock: createProductDto.stock,
      images: createProductDto.images,
      category: { connect: { id: createProductDto.categoryId } },
      ...(createProductDto.brandId && { brand: { connect: { id: createProductDto.brandId } } })
    });
  }

  async findAll(pageStr?: string, limitStr?: string, sort?: string, isFlashSale?: string) {
    let orderBy: any = undefined;
    if (sort === 'price-asc') orderBy = { price: 'asc' };
    else if (sort === 'price-desc') orderBy = { price: 'desc' };
    else if (sort === 'newest') orderBy = { createdAt: 'desc' };

    if (!pageStr && !limitStr) {
      // For backwards compatibility, if no pagination params are provided, return all
      // OR we can just return { data, meta } and let the frontend handle it.
      // The prompt asks to add pagination, so returning { data, meta } is the standard way.
      // Let's implement it consistently.
      let where: any = {};
      if (isFlashSale === 'true') {
        where.isFlashSale = true;
      }
      const data = await this.productRepository.findAll({ where, orderBy });
      return { data, meta: { total: data.length, page: 1, limit: data.length, totalPages: 1 } };
    }

    const page = pageStr ? parseInt(pageStr, 10) : 1;
    const limit = limitStr ? parseInt(limitStr, 10) : 20;
    const skip = (page - 1) * limit;

    let where: any = {};
    if (isFlashSale === 'true') {
      where.isFlashSale = true;
    }

    const [data, total] = await Promise.all([
      this.productRepository.findAll({ where, skip, take: limit, orderBy }),
      this.productRepository.count(where)
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async search(query: string, pageStr?: string, limitStr?: string) {
    const page = pageStr ? parseInt(pageStr, 10) : 1;
    const limit = limitStr ? parseInt(limitStr, 10) : 10;
    const skip = (page - 1) * limit;

    // Tokenize query into separate words
    const tokens = query.trim().split(/\s+/).filter(t => t.length > 0);

    if (tokens.length === 0) {
      return { data: [], meta: { total: 0, page, limit, totalPages: 0 } };
    }

    // 1. Resolve Category IDs for EACH token
    const tokenCategoryMap = new Map<string, string[]>();

    for (const token of tokens) {
      const matchingCategories = await this.prisma.category.findMany({
        where: { name: { contains: token, mode: 'insensitive' as any } },
        select: { id: true }
      });
      
      let allCategoryIds = matchingCategories.map(c => c.id);
      
      if (allCategoryIds.length > 0) {
        const subCategories = await this.prisma.category.findMany({
          where: { parentId: { in: allCategoryIds } },
          select: { id: true }
        });
        const subCategoryIds = subCategories.map(c => c.id);
        allCategoryIds = [...allCategoryIds, ...subCategoryIds];
        
        if (subCategoryIds.length > 0) {
          const subSubCategories = await this.prisma.category.findMany({
            where: { parentId: { in: subCategoryIds } },
            select: { id: true }
          });
          allCategoryIds = [...allCategoryIds, ...subSubCategories.map(c => c.id)];
        }
      }
      
      tokenCategoryMap.set(token, allCategoryIds);
    }

    // 2. Build AND conditions for multi-token matching
    const andConditions = tokens.map(token => {
      const catIds = tokenCategoryMap.get(token) || [];
      return {
        OR: [
          { name: { contains: token, mode: 'insensitive' as any } },
          { description: { contains: token, mode: 'insensitive' as any } },
          { color: { contains: token, mode: 'insensitive' as any } },
          { warrantyType: { contains: token, mode: 'insensitive' as any } },
          { caseMaterial: { contains: token, mode: 'insensitive' as any } },
          { brand: { name: { contains: token, mode: 'insensitive' as any } } },
          ...(catIds.length > 0 ? [{ categoryId: { in: catIds } }] : [])
        ]
      };
    });

    const where = {
      AND: andConditions
    };

    const [data, total] = await Promise.all([
      this.productRepository.findAll({ 
        where, 
        skip, 
        take: limit, 
        orderBy: { createdAt: 'desc' }
      }),
      this.productRepository.count({ where })
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findOne(id: string) {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    let slug;
    if (updateProductDto.name) {
      slug = slugify(updateProductDto.name, { lower: true, strict: true });
      const existing = await this.productRepository.findBySlug(slug);
      if (existing && existing.id !== id) {
        throw new ConflictException('Product with this name already exists');
      }
    }

    return this.productRepository.update(id, {
      ...updateProductDto,
      ...(slug && { slug }),
      ...(updateProductDto.categoryId && { category: { connect: { id: updateProductDto.categoryId } } }),
      ...(updateProductDto.brandId && { brand: { connect: { id: updateProductDto.brandId } } })
    });
  }

  async remove(id: string) {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return this.productRepository.delete(id);
  }
}
