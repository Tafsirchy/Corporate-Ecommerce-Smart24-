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

  async findAll() {
    return this.productRepository.findAll({});
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
