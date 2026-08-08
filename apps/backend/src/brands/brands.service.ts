import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { BrandRepository } from '../repositories/brand.repository.service';
import slugify from 'slugify';

@Injectable()
export class BrandsService {
  constructor(private brandRepository: BrandRepository) {}

  async create(createBrandDto: CreateBrandDto) {
    const slug = slugify(createBrandDto.name, { lower: true, strict: true });

    const existing = await this.brandRepository.findBySlug(slug);
    if (existing) {
      throw new ConflictException('Brand with this name already exists');
    }

    return this.brandRepository.create({
      ...createBrandDto,
      slug,
    });
  }

  async findAll(query: { page?: number; limit?: number; search?: string } = {}) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where = query.search
      ? { name: { contains: query.search, mode: 'insensitive' as any } }
      : {};

    const [data, total] = await Promise.all([
      (this.brandRepository as any).prisma.brand.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      (this.brandRepository as any).prisma.brand.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const brand = await this.brandRepository.findById(id);
    if (!brand) {
      throw new NotFoundException('Brand not found');
    }
    return brand;
  }

  async update(id: string, updateBrandDto: UpdateBrandDto) {
    let slug;
    if (updateBrandDto.name) {
      slug = slugify(updateBrandDto.name, { lower: true, strict: true });
      const existing = await this.brandRepository.findBySlug(slug);
      if (existing && existing.id !== id) {
        throw new ConflictException('Brand with this name already exists');
      }
    }

    return this.brandRepository.update(id, {
      ...updateBrandDto,
      ...(slug && { slug }),
    });
  }

  async remove(id: string) {
    const brand = await this.brandRepository.findById(id);
    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    const productsCount = await (this.brandRepository as any).prisma.product.count({
      where: { brandId: id },
    });

    if (productsCount > 0) {
      throw new ConflictException(
        `Cannot delete brand because it is attached to ${productsCount} product(s).`
      );
    }

    return this.brandRepository.delete(id);
  }
}
