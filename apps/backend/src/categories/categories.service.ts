import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryRepository } from '../repositories/category.repository.service';
import slugify from 'slugify';

@Injectable()
export class CategoriesService {
  constructor(private categoryRepository: CategoryRepository) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const slug = slugify(createCategoryDto.name, { lower: true, strict: true });

    const existing = await this.categoryRepository.findBySlug(slug);
    if (existing) {
      throw new ConflictException('Category with this name already exists');
    }

    let level = 1;
    if (createCategoryDto.parentId) {
      const parent = await this.categoryRepository.findById(
        createCategoryDto.parentId,
      );
      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }
      level = parent.level + 1;
      if (level > 3) {
        throw new ConflictException('Maximum category depth (3) exceeded');
      }
    }

    return this.categoryRepository.create({
      name: createCategoryDto.name,
      slug,
      level,
      isActive: createCategoryDto.isActive !== undefined ? createCategoryDto.isActive : true,
      parent: createCategoryDto.parentId
        ? { connect: { id: createCategoryDto.parentId } }
        : undefined,
    });
  }

  async findAll(pageStr?: string, limitStr?: string) {
    if (!pageStr && !limitStr) {
      return this.categoryRepository.findAll({});
    }

    const page = pageStr ? parseInt(pageStr, 10) : 1;
    const limit = limitStr ? parseInt(limitStr, 10) : 50;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.categoryRepository.findAll({ skip, take: limit }),
      // Using prisma directly for count since repository doesn't have count method
      (this.categoryRepository as any).prisma.category.count(),
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
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    let slug;
    if (updateCategoryDto.name) {
      slug = slugify(updateCategoryDto.name, { lower: true, strict: true });
      const existing = await this.categoryRepository.findBySlug(slug);
      if (existing && existing.id !== id) {
        throw new ConflictException('Category with this name already exists');
      }
    }

    let level;
    if (updateCategoryDto.parentId) {
      const parent = await this.categoryRepository.findById(
        updateCategoryDto.parentId,
      );
      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }
      level = parent.level + 1;
      if (level > 3) {
        throw new ConflictException('Maximum category depth (3) exceeded');
      }
    }

    return this.categoryRepository.update(id, {
      ...updateCategoryDto,
      ...(slug && { slug }),
      ...(level && { level }),
      parent: updateCategoryDto.parentId
        ? { connect: { id: updateCategoryDto.parentId } }
        : undefined,
    });
  }

  async remove(id: string) {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    if (category.children.length > 0) {
      throw new ConflictException('Cannot delete category with children');
    }
    const productsCount = await (this.categoryRepository as any).prisma.product.count({
      where: { categoryId: id },
    });
    if (productsCount > 0) {
      throw new ConflictException('Cannot delete category with associated products');
    }
    return this.categoryRepository.delete(id);
  }
}
