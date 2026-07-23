import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  private async _updateProductRating(productId: string) {
    const aggr = await this.prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true }
    });
    await this.prisma.product.update({
      where: { id: productId },
      data: {
        rating: aggr._avg.rating || 0,
        reviewCount: aggr._count.rating || 0
      }
    });
  }

  async create(userId: string, createReviewDto: any) {
    const { productId, rating, comment, images } = createReviewDto;
    
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be a number between 1 and 5');
    }

    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');

    const existingReview = await this.prisma.review.findFirst({
      where: { userId, productId }
    });
    if (existingReview) {
      throw new BadRequestException('You have already reviewed this product.');
    }

    // Check if user bought it (looking for DELIVERED status for strictness, but any order works for simplicity)
    const orderItem = await this.prisma.orderItem.findFirst({
      where: {
        productId,
        order: { userId } 
      }
    });

    const review = await this.prisma.review.create({
      data: {
        userId,
        productId,
        rating,
        comment,
        images: images || [],
        verifiedPurchase: !!orderItem
      },
      include: {
        user: { select: { name: true } }
      }
    });

    await this._updateProductRating(productId);
    return review;
  }

  async findAllByProduct(productId: string) {
    return this.prisma.review.findMany({
      where: { productId },
      include: {
        user: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findUserReviews(userId: string) {
    return this.prisma.review.findMany({
      where: { userId },
      include: {
        product: { select: { id: true, name: true, slug: true, images: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findPendingReviews(userId: string) {
    // Products from delivered orders
    const deliveredItems = await this.prisma.orderItem.findMany({
      where: {
        order: {
          userId,
          status: 'DELIVERED'
        }
      },
      include: {
        product: { select: { id: true, name: true, slug: true, images: true, price: true } },
        order: { select: { id: true, createdAt: true } }
      }
    });

    // Products already reviewed by this user
    const userReviews = await this.prisma.review.findMany({
      where: { userId },
      select: { productId: true }
    });
    const reviewedProductIds = new Set(userReviews.map(r => r.productId));

    // Filter pending items
    const pendingProducts = new Map();
    for (const item of deliveredItems) {
      if (!reviewedProductIds.has(item.productId) && !pendingProducts.has(item.productId)) {
        pendingProducts.set(item.productId, {
          product: item.product,
          orderId: item.orderId,
          orderDate: item.order.createdAt
        });
      }
    }

    return Array.from(pendingProducts.values());
  }

  async update(userId: string, reviewId: string, updateReviewDto: any) {
    const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('Review not found');
    if (review.userId !== userId) throw new ForbiddenException('You can only edit your own reviews');

    const { rating, comment, images } = updateReviewDto;
    if (rating !== undefined && (typeof rating !== 'number' || rating < 1 || rating > 5)) {
      throw new BadRequestException('Rating must be a number between 1 and 5');
    }

    const updated = await this.prisma.review.update({
      where: { id: reviewId },
      data: { rating, comment, images },
      include: { user: { select: { name: true } } }
    });

    await this._updateProductRating(review.productId);
    return updated;
  }

  async remove(userId: string, reviewId: string) {
    const review = await this.prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('Review not found');
    if (review.userId !== userId) throw new ForbiddenException('You can only delete your own reviews');

    await this.prisma.review.delete({ where: { id: reviewId } });
    await this._updateProductRating(review.productId);
    return { success: true };
  }
}
