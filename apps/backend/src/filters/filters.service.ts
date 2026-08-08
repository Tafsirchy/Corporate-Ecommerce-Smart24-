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

  async findAll() {
    return this.prisma.filterDefinition.findMany({
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findActive() {
    return this.prisma.filterDefinition.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findSuggested() {
    return this.prisma.filterDefinition.findMany({
      where: { status: 'SUGGESTED' },
      orderBy: { createdAt: 'desc' },
    });
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
