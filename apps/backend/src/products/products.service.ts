import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductRepository } from '../repositories/product.repository.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../common/email/email.service';
import slugify from 'slugify';

@Injectable()
export class ProductsService {
  constructor(
    private productRepository: ProductRepository,
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const slug = slugify(createProductDto.name, { lower: true, strict: true });

    const existing = await this.productRepository.findBySlug(slug);
    if (existing) {
      throw new ConflictException('Product with this name already exists');
    }

    const detectedAttributes = await this.autoDetectAttributes(
      createProductDto.name,
      createProductDto.description,
      createProductDto.categoryId,
      createProductDto.attributes,
    );

    const sku = createProductDto.sku || `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    return this.productRepository.create({
      name: createProductDto.name,
      slug,
      sku,
      description: createProductDto.description,
      price: createProductDto.price,
      stock: createProductDto.stock,
      images: createProductDto.images,
      attributes: detectedAttributes,
      category: { connect: { id: createProductDto.categoryId } },
      ...(createProductDto.brandId && {
        brand: { connect: { id: createProductDto.brandId } },
      }),
    });
  }

  private buildDynamicFilterWhere(dynamicFiltersStr?: string) {
    if (!dynamicFiltersStr) return [];
    try {
      const filters = JSON.parse(dynamicFiltersStr);
      const andConditions: any[] = [];
      for (const [key, values] of Object.entries(filters)) {
        if (Array.isArray(values) && values.length > 0) {
          andConditions.push({
            attributes: {
              some: {
                filterKey: key,
                value: { in: values },
              },
            },
          });
        }
      }
      return andConditions;
    } catch (e) {
      return [];
    }
  }

  private buildStandardFiltersWhere(
    minPrice?: string,
    maxPrice?: string,
    rating?: string,
    brands?: string,
  ) {
    const where: any = {};

    // Price
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = parseFloat(minPrice);
      if (maxPrice !== undefined) where.price.lte = parseFloat(maxPrice);
    }

    // Rating
    if (rating !== undefined) {
      where.rating = { gte: parseFloat(rating) };
    }

    // Brands
    if (brands) {
      try {
        const brandSlugs = JSON.parse(brands);
        if (Array.isArray(brandSlugs) && brandSlugs.length > 0) {
          where.brand = { slug: { in: brandSlugs } };
        }
      } catch (e) {
        // Fallback for single string or invalid json
        if (typeof brands === 'string' && brands.trim() !== '') {
          where.brand = { slug: brands };
        }
      }
    }

    return where;
  }

  async findAll(
    pageStr?: string,
    limitStr?: string,
    sort?: string,
    isFlashSale?: string,
    categorySlugOrId?: string,
    search?: string,
    dynamicFilters?: string,
    minPrice?: string,
    maxPrice?: string,
    rating?: string,
    brands?: string,
    isAdmin: boolean = false,
  ) {
    let orderBy: any = undefined;
    if (sort === 'price-asc') orderBy = { price: 'asc' };
    else if (sort === 'price-desc') orderBy = { price: 'desc' };
    else if (sort === 'newest') orderBy = { createdAt: 'desc' };

    const baseWhere: any = {};
    if (!isAdmin) {
      baseWhere.isActive = true;
    }

    if (!pageStr && !limitStr) {
      const where: any = { ...baseWhere };
      if (isFlashSale === 'true') {
        where.isFlashSale = true;
      }
      if (search) {
        where.name = { contains: search, mode: 'insensitive' };
      }
      const data = await this.productRepository.findAll({ where, orderBy });
      return {
        data,
        meta: {
          total: data.length,
          page: 1,
          limit: data.length,
          totalPages: 1,
        },
      };
    }

    let page = pageStr ? parseInt(pageStr, 10) : 1;
    let limit = limitStr ? parseInt(limitStr, 10) : 20;
    if (Number.isNaN(page) || page < 1) page = 1;
    if (Number.isNaN(limit) || limit < 1) limit = 20;
    const skip = (page - 1) * limit;

    const where: any = {
      ...baseWhere,
      ...this.buildStandardFiltersWhere(minPrice, maxPrice, rating, brands),
    };

    if (isFlashSale === 'true') {
      where.isFlashSale = true;
    }

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    // Category resolution
    if (categorySlugOrId) {
      // Check if it's an ID or Slug
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(categorySlugOrId);
      const catCondition = isObjectId
        ? { id: categorySlugOrId }
        : { slug: categorySlugOrId };
      const category = await this.prisma.category.findFirst({
        where: catCondition,
      });

      if (category) {
        // Find descendants
        const subCategories = await this.prisma.category.findMany({
          where: { parentId: category.id },
          select: { id: true },
        });
        let catIds = [category.id, ...subCategories.map((c) => c.id)];
        if (subCategories.length > 0) {
          const subSub = await this.prisma.category.findMany({
            where: { parentId: { in: subCategories.map((c) => c.id) } },
            select: { id: true },
          });
          catIds = [...catIds, ...subSub.map((c) => c.id)];
        }
        where.categoryId = { in: catIds };
      }
    }

    // Dynamic filters
    const filterConditions = this.buildDynamicFilterWhere(dynamicFilters);
    if (filterConditions.length > 0) {
      where.AND = filterConditions;
    }

    const [data, total] = await Promise.all([
      this.productRepository.findAll({ where, skip, take: limit, orderBy }),
      this.productRepository.count({ where }),
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

  async search(
    query: string,
    pageStr?: string,
    limitStr?: string,
    dynamicFilters?: string,
    minPrice?: string,
    maxPrice?: string,
    rating?: string,
    brands?: string,
    isAdmin: boolean = false,
  ) {
    let page = pageStr ? parseInt(pageStr, 10) : 1;
    let limit = limitStr ? parseInt(limitStr, 10) : 10;
    if (Number.isNaN(page) || page < 1) page = 1;
    if (Number.isNaN(limit) || limit < 1) limit = 10;
    const skip = (page - 1) * limit;

    const tokens = query
      .trim()
      .split(/\s+/)
      .filter((t) => t.length > 0);

    if (tokens.length === 0) {
      return { data: [], meta: { total: 0, page, limit, totalPages: 0 } };
    }

    // 1. Optimize: Find all matching categories in one query
    const categoryTokensRegex = tokens.map((t) => ({
      name: { contains: t, mode: 'insensitive' as any },
    }));
    const matchingCategories = await this.prisma.category.findMany({
      where: { OR: categoryTokensRegex },
      select: { id: true, name: true },
    });

    // Resolve descendants
    let allCategoryIds = matchingCategories.map((c) => c.id);
    if (allCategoryIds.length > 0) {
      const subCategories = await this.prisma.category.findMany({
        where: { parentId: { in: allCategoryIds } },
        select: { id: true },
      });
      const subCategoryIds = subCategories.map((c) => c.id);
      allCategoryIds = [...allCategoryIds, ...subCategoryIds];
      if (subCategoryIds.length > 0) {
        const subSubCategories = await this.prisma.category.findMany({
          where: { parentId: { in: subCategoryIds } },
          select: { id: true },
        });
        allCategoryIds = [
          ...allCategoryIds,
          ...subSubCategories.map((c) => c.id),
        ];
      }
    }

    // Map token to category IDs purely in memory to avoid N+1 DB queries per token
    const tokenCategoryMap = new Map<string, string[]>();
    for (const token of tokens) {
      const regex = new RegExp(token, 'i');
      const matchedBaseCatIds = matchingCategories
        .filter((c) => regex.test(c.name))
        .map((c) => c.id);
      // If a token matches a base category, we consider ALL resolved descendants valid for this token
      // For simplicity in search, if any category matched, we'll use all resolved IDs for that token
      if (matchedBaseCatIds.length > 0) {
        tokenCategoryMap.set(token, allCategoryIds);
      }
    }

    // 2. Build AND conditions for multi-token matching
    const andConditions = tokens.map((token) => {
      const catIds = tokenCategoryMap.get(token) || [];
      return {
        OR: [
          { name: { contains: token, mode: 'insensitive' as any } },
          { description: { contains: token, mode: 'insensitive' as any } },
          { brand: { name: { contains: token, mode: 'insensitive' as any } } },
          ...(catIds.length > 0 ? [{ categoryId: { in: catIds } }] : []),
        ],
      };
    });

    // Dynamic filters
    const dynamicFilterConditions =
      this.buildDynamicFilterWhere(dynamicFilters);

    // Standard filters
    const standardFilterConditions = this.buildStandardFiltersWhere(
      minPrice,
      maxPrice,
      rating,
      brands,
    );

    const where: any = {
      AND: [...andConditions, ...dynamicFilterConditions],
      ...standardFilterConditions,
    };

    if (!isAdmin) {
      where.isActive = true;
    }

    const [data, total] = await Promise.all([
      this.productRepository.findAll({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.productRepository.count({ where }),
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
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async findBySlug(slug: string) {
    const product = await this.productRepository.findBySlug(slug);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async subscribeToAlert(productId: string, email: string, userId?: string) {
    const product = await this.productRepository.findById(productId);
    if (!product) throw new NotFoundException('Product not found');

    if (product.stock > 0) {
      throw new BadRequestException('Product is already in stock');
    }

    const existingAlert = await this.prisma.backInStockAlert.findFirst({
      where: { productId, email },
    });

    if (existingAlert) {
      if (!existingAlert.isNotified) {
        throw new ConflictException('You are already subscribed to this alert');
      } else {
        return this.prisma.backInStockAlert.update({
          where: { id: existingAlert.id },
          data: { isNotified: false },
        });
      }
    }

    return this.prisma.backInStockAlert.create({
      data: {
        productId,
        email,
        userId,
      },
    });
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

    const dataToUpdate: any = { ...updateProductDto };
    delete dataToUpdate.categoryId;
    delete dataToUpdate.brandId;

    const updatedProduct = await this.productRepository.update(id, {
      ...dataToUpdate,
      ...(slug && { slug }),
      ...(updateProductDto.categoryId && {
        category: { connect: { id: updateProductDto.categoryId } },
      }),
      ...(updateProductDto.brandId && {
        brand: { connect: { id: updateProductDto.brandId } },
      }),
    });

    // Check if stock was updated and is > 0
    if (updateProductDto.stock !== undefined && updateProductDto.stock > 0) {
      const pendingAlerts = await this.prisma.backInStockAlert.findMany({
        where: { productId: id, isNotified: false },
      });
      if (pendingAlerts.length > 0) {
        for (const alert of pendingAlerts) {
          this.emailService
            .sendBackInStockEmail(alert.email, updatedProduct.name)
            .catch((err) => {
              console.error('Alert email error:', err);
            });
        }
        await this.prisma.backInStockAlert.updateMany({
          where: { id: { in: pendingAlerts.map((a) => a.id) } },
          data: { isNotified: true },
        });
      }
    }

    return updatedProduct;
  }

  async remove(id: string) {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return this.productRepository.delete(id);
  }

  // --- Auto Detection Engine (Rule-based Regex) ---
  private async autoDetectAttributes(
    name: string,
    description: string,
    categoryId: string,
    manualAttributes: any[] = [],
  ) {
    // 1. Get all active filter definitions that apply to this category
    const activeFilters = await this.prisma.filterDefinition.findMany({
      where: {
        status: 'ACTIVE',
      },
    });

    const applicableFilters = activeFilters.filter(
      (f) =>
        !f.categoryIds ||
        f.categoryIds.length === 0 ||
        f.categoryIds.includes(categoryId),
    );

    const fullText = `${name} ${description}`.toLowerCase();
    const finalAttributes = [...manualAttributes];

    // 2. Scan text for each filter's predefined values
    for (const filter of applicableFilters) {
      if (
        filter.type === 'RANGE' ||
        !filter.values ||
        !Array.isArray(filter.values)
      )
        continue;

      // If the attribute was already provided manually, skip auto-detection for it (to respect admin choice)
      const hasManualVal = manualAttributes.some(
        (a) => a.filterKey === filter.key,
      );
      if (hasManualVal && filter.type !== 'CHECKBOX') continue; // For checkboxes we might want multiple, but let's be safe and just merge them

      for (const valObj of filter.values) {
        const valStr = valObj.value.toLowerCase();

        // Escape regex special characters from the value string
        const escapedVal = valStr.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
        // We look for whole word boundaries (or start/end of string)
        const regex = new RegExp(`(?:^|\\W)(${escapedVal})(?:$|\\W)`, 'i');

        if (regex.test(fullText)) {
          // Check if we haven't already added this value manually or detected it
          const alreadyExists = finalAttributes.some(
            (a) => a.filterKey === filter.key && a.value === valObj.value,
          );

          if (!alreadyExists) {
            finalAttributes.push({
              filterKey: filter.key,
              value: valObj.value,
              source: 'auto_regex',
              confidence: 0.9, // High confidence for exact regex match
            });
          }
        }
      }
    }

    return finalAttributes;
  }

  // --- Faceted Counts (MongoDB Aggregation) ---
  async getFacetedCounts(
    categoryIdOrSlug?: string,
    searchQuery?: string,
    dynamicFilters?: string,
  ) {
    const matchStage: any = {};

    // 1. Resolve Category
    if (categoryIdOrSlug) {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(categoryIdOrSlug);
      const catCondition = isObjectId
        ? { id: categoryIdOrSlug }
        : { slug: categoryIdOrSlug };
      const category = await this.prisma.category.findFirst({
        where: catCondition,
      });
      if (category) {
        const subCategories = await this.prisma.category.findMany({
          where: { parentId: category.id },
          select: { id: true },
        });
        let catIds = [category.id, ...subCategories.map((c) => c.id)];
        if (subCategories.length > 0) {
          const subSub = await this.prisma.category.findMany({
            where: { parentId: { in: subCategories.map((c) => c.id) } },
            select: { id: true },
          });
          catIds = [...catIds, ...subSub.map((c) => c.id)];
        }
        matchStage.categoryId = { $in: catIds.map((id) => ({ $oid: id })) };
      }
    }

    // 2. Resolve Search Query (Simple regex for name/description)
    if (searchQuery && searchQuery.trim().length > 0) {
      matchStage.$or = [
        { name: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } },
      ];
    }

    // (Optional: We could include dynamic filters in match stage to narrow counts,
    // but usually faceted counts should show what's available *within the current category/search*,
    // even if some filters are currently active, though behavior varies by design.
    // We will omit dynamicFilters from the match stage so the user sees all options in the category).

    // 3. Aggregate
    const pipeline: any[] = [];
    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    pipeline.push(
      { $unwind: '$attributes' },
      {
        $group: {
          _id: {
            filterKey: '$attributes.filterKey',
            value: '$attributes.value',
          },
          count: { $sum: 1 },
        },
      },
    );

    const result = await this.prisma.product.aggregateRaw({
      pipeline,
    });

    // Parse the Raw result
    const facets: Record<string, Record<string, number>> = {};
    if (Array.isArray(result)) {
      result.forEach((item: any) => {
        const key = item._id.filterKey;
        const val = item._id.value;
        const count = item.count;
        if (!facets[key]) facets[key] = {};
        facets[key][val] = count;
      });
    }

    return facets;
  }
}
