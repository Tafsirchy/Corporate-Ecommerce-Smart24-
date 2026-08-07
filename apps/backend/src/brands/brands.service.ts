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

  async findAll() {
    return this.brandRepository.findAll({});
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
    return this.brandRepository.delete(id);
  }
}
