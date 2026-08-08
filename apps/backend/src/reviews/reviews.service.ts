import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  private async _updateProductRating(productId: string) {
    const aggr = await this.prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true },
    });
    await this.prisma.product.update({
      where: { id: productId },
      data: {
        rating: aggr._avg.rating || 0,
        reviewCount: aggr._count.rating || 0,
      },
    });
  }

  async create(userId: string, createReviewDto: CreateReviewDto) {
    const { productId, rating, comment, images } = createReviewDto;

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Product not found');

    const existingReview = await this.prisma.review.findFirst({
      where: { userId, productId },
    });
    if (existingReview) {
      throw new BadRequestException('You have already reviewed this product.');
    }

    // Check if user bought it (looking for DELIVERED status for strictness, but any order works for simplicity)
    const orderItem = await this.prisma.orderItem.findFirst({
      where: {
        productId,
        order: { userId },
      },
    });

    const review = await this.prisma.review.create({
      data: {
        userId,
        productId,
        rating,
        comment: comment || '',
        images: images || [],
        verifiedPurchase: !!orderItem,
      },
      include: {
        user: { select: { name: true } },
      },
    });

    await this._updateProductRating(productId);
    return review;
  }

  async findAllByProduct(productId: string, query: { page?: number; limit?: number } = {}) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { productId },
        skip,
        take: limit,
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.review.count({ where: { productId } }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findUserReviews(userId: string, query: { page?: number; limit?: number } = {}) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { userId },
        skip,
        take: limit,
        include: {
          product: { select: { id: true, name: true, slug: true, images: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.review.count({ where: { userId } }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findPendingReviews(userId: string) {
    // Products from delivered orders
    const deliveredItems = await this.prisma.orderItem.findMany({
      where: {
        order: {
          userId,
          status: 'DELIVERED',
        },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            images: true,
            price: true,
          },
        },
        order: { select: { id: true, createdAt: true } },
      },
    });

    // Products already reviewed by this user
    const userReviews = await this.prisma.review.findMany({
      where: { userId },
      select: { productId: true },
    });
    const reviewedProductIds = new Set(userReviews.map((r) => r.productId));

    // Filter pending items
    const pendingProducts = new Map();
    for (const item of deliveredItems) {
      if (
        !reviewedProductIds.has(item.productId) &&
        !pendingProducts.has(item.productId)
      ) {
        pendingProducts.set(item.productId, {
          product: item.product,
          orderId: item.orderId,
          orderDate: item.order.createdAt,
        });
      }
    }

    return Array.from(pendingProducts.values());
  }

  async update(userId: string, reviewId: string, updateReviewDto: UpdateReviewDto) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });
    if (!review) throw new NotFoundException('Review not found');
    if (review.userId !== userId)
      throw new ForbiddenException('You can only edit your own reviews');

    const { rating, comment, images } = updateReviewDto;

    const updated = await this.prisma.review.update({
      where: { id: reviewId },
      data: { rating, comment, images },
      include: { user: { select: { name: true } } },
    });

    await this._updateProductRating(review.productId);
    return updated;
  }

  async remove(userId: string, reviewId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });
    if (!review) throw new NotFoundException('Review not found');
    if (review.userId !== userId)
      throw new ForbiddenException('You can only delete your own reviews');

    await this.prisma.review.delete({ where: { id: reviewId } });
    await this._updateProductRating(review.productId);
    return { message: 'Review deleted successfully' };
  }

  // --- Admin Endpoints ---

  async findAllAdmin(query: { page?: number; limit?: number } = {}) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.review.findMany({
        skip,
        take: limit,
        include: {
          user: { select: { name: true, email: true } },
          product: { select: { name: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.review.count(),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async removeAdmin(reviewId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });
    if (!review) throw new NotFoundException('Review not found');

    await this.prisma.review.delete({ where: { id: reviewId } });
    await this._updateProductRating(review.productId);
    return { message: 'Review deleted successfully by admin' };
  }
}
