import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFilterDto } from './dto/create-filter.dto';
import { UpdateFilterDto } from './dto/update-filter.dto';

@Injectable()
export class FiltersService {
  constructor(private prisma: PrismaService) {}

  async create(createFilterDto: CreateFilterDto) {
    const existing = await this.prisma.filterDefinition.findUnique({
      where: { key: createFilterDto.key },
    });

    if (existing) {
      throw new ConflictException(
        `Filter with key ${createFilterDto.key} already exists`,
      );
    }

    return this.prisma.filterDefinition.create({
      data: createFilterDto,
    });
  }

  async findAll(query: { page?: number; limit?: number } = {}) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.filterDefinition.findMany({
        skip,
        take: limit,
        orderBy: { displayOrder: 'asc' },
      }),
      this.prisma.filterDefinition.count(),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findActive(query: { page?: number; limit?: number } = {}) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.filterDefinition.findMany({
        where: { status: 'ACTIVE' },
        skip,
        take: limit,
        orderBy: { displayOrder: 'asc' },
      }),
      this.prisma.filterDefinition.count({ where: { status: 'ACTIVE' } }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findSuggested(query: { page?: number; limit?: number } = {}) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.filterDefinition.findMany({
        where: { status: 'SUGGESTED' },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.filterDefinition.count({ where: { status: 'SUGGESTED' } }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const filter = await this.prisma.filterDefinition.findUnique({
      where: { id },
    });
    if (!filter) throw new NotFoundException(`Filter #${id} not found`);
    return filter;
  }

  async update(id: string, updateFilterDto: UpdateFilterDto) {
    const filter = await this.prisma.filterDefinition.findUnique({
      where: { id },
    });
    if (!filter) throw new NotFoundException(`Filter #${id} not found`);

    if (updateFilterDto.key && updateFilterDto.key !== filter.key) {
      const existing = await this.prisma.filterDefinition.findUnique({
        where: { key: updateFilterDto.key },
      });
      if (existing)
        throw new ConflictException(
          `Filter key ${updateFilterDto.key} is taken`,
        );
    }

    return this.prisma.filterDefinition.update({
      where: { id },
      data: updateFilterDto,
    });
  }

  async remove(id: string) {
    const filter = await this.prisma.filterDefinition.findUnique({
      where: { id },
    });
    if (!filter) throw new NotFoundException(`Filter #${id} not found`);

    // In a real app, we might check if products use this filter and warn or cleanup.
    // For now we allow deletion.
    return this.prisma.filterDefinition.delete({
      where: { id },
    });
  }
}
