import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import slugify from 'slugify';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createClientDto: CreateClientDto) {
    const rawSlug =
      createClientDto.slug?.trim() || createClientDto.name.trim();
    const slug = slugify(rawSlug, { lower: true, strict: true });

    const existingName = await this.prisma.client.findUnique({
      where: { name: createClientDto.name.trim() },
    });
    if (existingName) {
      throw new ConflictException('A client with this name already exists');
    }

    const existingSlug = await this.prisma.client.findUnique({
      where: { slug },
    });
    if (existingSlug) {
      throw new ConflictException('A client with this slug already exists');
    }

    return this.prisma.client.create({
      data: {
        name: createClientDto.name.trim(),
        slug,
        logoUrl: createClientDto.logoUrl,
        websiteUrl: createClientDto.websiteUrl?.trim() || null,
        industry: createClientDto.industry?.trim() || null,
        description: createClientDto.description?.trim() || null,
        productIds: createClientDto.productIds || [],
        purchaseNote: createClientDto.purchaseNote?.trim() || null,
        isActive:
          createClientDto.isActive !== undefined
            ? createClientDto.isActive
            : true,
        order: createClientDto.order !== undefined ? createClientDto.order : 0,
      },
    });
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    industry?: string;
    activeOnly?: boolean | string;
  } = {}) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.activeOnly === true || query.activeOnly === 'true') {
      where.isActive = true;
    }

    if (query.industry && query.industry !== 'all') {
      where.industry = query.industry;
    }

    if (query.search && query.search.trim()) {
      where.OR = [
        { name: { contains: query.search.trim(), mode: 'insensitive' } },
        { industry: { contains: query.search.trim(), mode: 'insensitive' } },
        { description: { contains: query.search.trim(), mode: 'insensitive' } },
      ];
    }

    const [clients, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.client.count({ where }),
    ]);

    return {
      data: clients,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
    });
    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const products = await this.fetchProductsForClient(client.productIds);

    return {
      ...client,
      products,
    };
  }

  async findBySlug(slug: string) {
    const client = await this.prisma.client.findUnique({
      where: { slug },
    });
    if (!client) {
      throw new NotFoundException(`Client with slug "${slug}" not found`);
    }

    const products = await this.fetchProductsForClient(client.productIds);

    return {
      ...client,
      products,
    };
  }

  private async fetchProductsForClient(productIds: string[]) {
    if (!productIds || productIds.length === 0) {
      return [];
    }

    return this.prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        discountPrice: true,
        images: true,
        sku: true,
        rating: true,
        reviewCount: true,
        stock: true,
        category: {
          select: { id: true, name: true, slug: true },
        },
        brand: {
          select: { id: true, name: true, slug: true },
        },
      },
    });
  }

  async update(id: string, updateClientDto: UpdateClientDto) {
    const existing = await this.prisma.client.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Client not found');
    }

    let slug = existing.slug;
    if (updateClientDto.slug && updateClientDto.slug.trim()) {
      slug = slugify(updateClientDto.slug.trim(), {
        lower: true,
        strict: true,
      });
    } else if (
      updateClientDto.name &&
      updateClientDto.name.trim() !== existing.name
    ) {
      slug = slugify(updateClientDto.name.trim(), {
        lower: true,
        strict: true,
      });
    }

    if (slug !== existing.slug) {
      const slugConflict = await this.prisma.client.findUnique({
        where: { slug },
      });
      if (slugConflict && slugConflict.id !== id) {
        throw new ConflictException('A client with this slug already exists');
      }
    }

    if (
      updateClientDto.name &&
      updateClientDto.name.trim() !== existing.name
    ) {
      const nameConflict = await this.prisma.client.findUnique({
        where: { name: updateClientDto.name.trim() },
      });
      if (nameConflict && nameConflict.id !== id) {
        throw new ConflictException('A client with this name already exists');
      }
    }

    return this.prisma.client.update({
      where: { id },
      data: {
        ...(updateClientDto.name && { name: updateClientDto.name.trim() }),
        slug,
        ...(updateClientDto.logoUrl && { logoUrl: updateClientDto.logoUrl }),
        ...(updateClientDto.websiteUrl !== undefined && {
          websiteUrl: updateClientDto.websiteUrl?.trim() || null,
        }),
        ...(updateClientDto.industry !== undefined && {
          industry: updateClientDto.industry?.trim() || null,
        }),
        ...(updateClientDto.description !== undefined && {
          description: updateClientDto.description?.trim() || null,
        }),
        ...(updateClientDto.productIds !== undefined && {
          productIds: updateClientDto.productIds,
        }),
        ...(updateClientDto.purchaseNote !== undefined && {
          purchaseNote: updateClientDto.purchaseNote?.trim() || null,
        }),
        ...(updateClientDto.isActive !== undefined && {
          isActive: updateClientDto.isActive,
        }),
        ...(updateClientDto.order !== undefined && {
          order: updateClientDto.order,
        }),
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.client.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Client not found');
    }
    return this.prisma.client.delete({
      where: { id },
    });
  }
}
