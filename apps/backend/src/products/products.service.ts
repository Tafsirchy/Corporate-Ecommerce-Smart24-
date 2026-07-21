import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductRepository } from '../repositories/product.repository.service';
import slugify from 'slugify';

@Injectable()
export class ProductsService {
  constructor(private productRepository: ProductRepository) {}

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

  async findAll(pageStr?: string, limitStr?: string, sort?: string) {
    let orderBy: any = undefined;
    if (sort === 'price-asc') orderBy = { price: 'asc' };
    else if (sort === 'price-desc') orderBy = { price: 'desc' };
    else if (sort === 'newest') orderBy = { createdAt: 'desc' };

    if (!pageStr && !limitStr) {
      // For backwards compatibility, if no pagination params are provided, return all
      // OR we can just return { data, meta } and let the frontend handle it.
      // The prompt asks to add pagination, so returning { data, meta } is the standard way.
      // Let's implement it consistently.
      const data = await this.productRepository.findAll({ orderBy });
      return { data, meta: { total: data.length, page: 1, limit: data.length, totalPages: 1 } };
    }

    const page = pageStr ? parseInt(pageStr, 10) : 1;
    const limit = limitStr ? parseInt(limitStr, 10) : 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.productRepository.findAll({ skip, take: limit, orderBy }),
      this.productRepository.count({})
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
