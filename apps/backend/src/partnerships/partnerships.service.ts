import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePartnerDto } from './dto/create-partner.dto';
import { UpdatePartnerDto } from './dto/update-partner.dto';
import slugify from 'slugify';

@Injectable()
export class PartnershipsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPartnerDto: CreatePartnerDto) {
    const rawSlug =
      createPartnerDto.slug?.trim() || createPartnerDto.name.trim();
    const slug = slugify(rawSlug, { lower: true, strict: true });

    const existingName = await this.prisma.partner.findUnique({
      where: { name: createPartnerDto.name.trim() },
    });
    if (existingName) {
      throw new ConflictException('A partner with this name already exists');
    }

    const existingSlug = await this.prisma.partner.findUnique({
      where: { slug },
    });
    if (existingSlug) {
      throw new ConflictException('A partner with this slug already exists');
    }

    const formattedSuppliedItems = (createPartnerDto.suppliedItems || []).map((item) => ({
      productId: item.productId?.trim() || null,
      productName: item.productName.trim(),
      sku: item.sku?.trim() || null,
      category: item.category?.trim() || null,
      price: item.price !== undefined && item.price !== null ? Number(item.price) : null,
      supplyPrice: item.supplyPrice !== undefined && item.supplyPrice !== null ? Number(item.supplyPrice) : null,
      availability: item.availability?.trim() || 'In Stock',
      warranty: item.warranty?.trim() || null,
      imageUrl: item.imageUrl?.trim() || null,
      description: item.description?.trim() || null,
    }));

    const formattedProcuredItems = (createPartnerDto.procuredItems || []).map((item) => ({
      productId: item.productId?.trim() || null,
      productName: item.productName.trim(),
      quantity: Number(item.quantity) || 1,
      purchasePrice: Number(item.purchasePrice) || 0,
      totalAmount:
        item.totalAmount !== undefined && item.totalAmount !== null
          ? Number(item.totalAmount)
          : (Number(item.quantity) || 1) * (Number(item.purchasePrice) || 0),
      purchaseDate: item.purchaseDate?.trim() || null,
      invoiceNo: item.invoiceNo?.trim() || null,
      notes: item.notes?.trim() || null,
    }));

    return this.prisma.partner.create({
      data: {
        name: createPartnerDto.name.trim(),
        slug,
        logoUrl: createPartnerDto.logoUrl,
        websiteUrl: createPartnerDto.websiteUrl?.trim() || null,
        industry: createPartnerDto.industry?.trim() || null,
        tier: createPartnerDto.tier?.trim() || null,
        description: createPartnerDto.description?.trim() || null,
        mouDetails: createPartnerDto.mouDetails?.trim() || null,
        suppliedProductIds: createPartnerDto.suppliedProductIds || [],
        suppliedItems: formattedSuppliedItems,
        procuredProductIds: createPartnerDto.procuredProductIds || [],
        procurementNote: createPartnerDto.procurementNote?.trim() || null,
        procuredItems: formattedProcuredItems,
        isActive:
          createPartnerDto.isActive !== undefined
            ? createPartnerDto.isActive
            : true,
        order: createPartnerDto.order !== undefined ? createPartnerDto.order : 0,
      },
    });
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    industry?: string;
    tier?: string;
    activeOnly?: boolean | string;
  } = {}) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.activeOnly === true || query.activeOnly === 'true') {
      where.isActive = true;
    }

    if (query.industry && query.industry !== 'all' && query.industry !== 'All') {
      where.industry = query.industry;
    }

    if (query.tier && query.tier !== 'all' && query.tier !== 'All') {
      where.tier = query.tier;
    }

    if (query.search && query.search.trim()) {
      where.OR = [
        { name: { contains: query.search.trim(), mode: 'insensitive' } },
        { industry: { contains: query.search.trim(), mode: 'insensitive' } },
        { tier: { contains: query.search.trim(), mode: 'insensitive' } },
        { description: { contains: query.search.trim(), mode: 'insensitive' } },
      ];
    }

    const [partners, total] = await Promise.all([
      this.prisma.partner.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.partner.count({ where }),
    ]);

    return {
      data: partners,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const partner = await this.prisma.partner.findUnique({
      where: { id },
    });
    if (!partner) {
      throw new NotFoundException('Partner not found');
    }

    const [suppliedProducts, procuredProducts] = await Promise.all([
      this.fetchProducts(partner.suppliedProductIds),
      this.fetchProducts(partner.procuredProductIds),
    ]);

    return {
      ...partner,
      suppliedProducts,
      procuredProducts,
    };
  }

  async findBySlug(slug: string) {
    const partner = await this.prisma.partner.findUnique({
      where: { slug },
    });
    if (!partner) {
      throw new NotFoundException('Partner not found');
    }

    const [suppliedProducts, procuredProducts] = await Promise.all([
      this.fetchProducts(partner.suppliedProductIds),
      this.fetchProducts(partner.procuredProductIds),
    ]);

    return {
      ...partner,
      suppliedProducts,
      procuredProducts,
    };
  }

  async update(id: string, updatePartnerDto: UpdatePartnerDto) {
    const existing = await this.prisma.partner.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Partner not found');
    }

    let slug = existing.slug;
    if (updatePartnerDto.name && updatePartnerDto.name.trim() !== existing.name) {
      const existingName = await this.prisma.partner.findUnique({
        where: { name: updatePartnerDto.name.trim() },
      });
      if (existingName && existingName.id !== id) {
        throw new ConflictException('A partner with this name already exists');
      }

      if (!updatePartnerDto.slug) {
        slug = slugify(updatePartnerDto.name.trim(), { lower: true, strict: true });
        const existingSlug = await this.prisma.partner.findUnique({
          where: { slug },
        });
        if (existingSlug && existingSlug.id !== id) {
          slug = `${slug}-${Date.now().toString().slice(-4)}`;
        }
      }
    }

    if (updatePartnerDto.slug && updatePartnerDto.slug.trim() !== existing.slug) {
      slug = slugify(updatePartnerDto.slug.trim(), { lower: true, strict: true });
      const existingSlug = await this.prisma.partner.findUnique({
        where: { slug },
      });
      if (existingSlug && existingSlug.id !== id) {
        throw new ConflictException('A partner with this slug already exists');
      }
    }

    const data: any = {
      ...(updatePartnerDto.name && { name: updatePartnerDto.name.trim() }),
      ...(slug && { slug }),
      ...(updatePartnerDto.logoUrl && { logoUrl: updatePartnerDto.logoUrl }),
      ...(updatePartnerDto.websiteUrl !== undefined && {
        websiteUrl: updatePartnerDto.websiteUrl?.trim() || null,
      }),
      ...(updatePartnerDto.industry !== undefined && {
        industry: updatePartnerDto.industry?.trim() || null,
      }),
      ...(updatePartnerDto.tier !== undefined && {
        tier: updatePartnerDto.tier?.trim() || null,
      }),
      ...(updatePartnerDto.description !== undefined && {
        description: updatePartnerDto.description?.trim() || null,
      }),
      ...(updatePartnerDto.mouDetails !== undefined && {
        mouDetails: updatePartnerDto.mouDetails?.trim() || null,
      }),
      ...(updatePartnerDto.suppliedProductIds !== undefined && {
        suppliedProductIds: updatePartnerDto.suppliedProductIds,
      }),
      ...(updatePartnerDto.suppliedItems !== undefined && {
        suppliedItems: (updatePartnerDto.suppliedItems || []).map((item) => ({
          productId: item.productId?.trim() || null,
          productName: item.productName.trim(),
          sku: item.sku?.trim() || null,
          category: item.category?.trim() || null,
          price: item.price !== undefined && item.price !== null ? Number(item.price) : null,
          supplyPrice: item.supplyPrice !== undefined && item.supplyPrice !== null ? Number(item.supplyPrice) : null,
          availability: item.availability?.trim() || 'In Stock',
          warranty: item.warranty?.trim() || null,
          imageUrl: item.imageUrl?.trim() || null,
          description: item.description?.trim() || null,
        })),
      }),
      ...(updatePartnerDto.procuredProductIds !== undefined && {
        procuredProductIds: updatePartnerDto.procuredProductIds,
      }),
      ...(updatePartnerDto.procurementNote !== undefined && {
        procurementNote: updatePartnerDto.procurementNote?.trim() || null,
      }),
      ...(updatePartnerDto.procuredItems !== undefined && {
        procuredItems: (updatePartnerDto.procuredItems || []).map((item) => ({
          productId: item.productId?.trim() || null,
          productName: item.productName.trim(),
          quantity: Number(item.quantity) || 1,
          purchasePrice: Number(item.purchasePrice) || 0,
          totalAmount:
            item.totalAmount !== undefined && item.totalAmount !== null
              ? Number(item.totalAmount)
              : (Number(item.quantity) || 1) * (Number(item.purchasePrice) || 0),
          purchaseDate: item.purchaseDate?.trim() || null,
          invoiceNo: item.invoiceNo?.trim() || null,
          notes: item.notes?.trim() || null,
        })),
      }),
      ...(updatePartnerDto.isActive !== undefined && {
        isActive: updatePartnerDto.isActive,
      }),
      ...(updatePartnerDto.order !== undefined && {
        order: updatePartnerDto.order,
      }),
    };

    return this.prisma.partner.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.partner.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Partner not found');
    }

    return this.prisma.partner.delete({
      where: { id },
    });
  }

  private async fetchProducts(productIds?: string[]) {
    if (!productIds || productIds.length === 0) {
      return [];
    }

    const validIds = productIds.filter(
      (id) => typeof id === 'string' && id.length === 24,
    );
    if (validIds.length === 0) {
      return [];
    }

    return this.prisma.product.findMany({
      where: {
        id: { in: validIds },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        price: true,
        discountPrice: true,
        stock: true,
        images: true,
        rating: true,
        reviewCount: true,
        isActive: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }
}

