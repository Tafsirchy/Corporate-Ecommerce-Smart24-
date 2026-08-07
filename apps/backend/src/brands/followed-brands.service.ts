import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FollowedBrandsService {
  constructor(private prisma: PrismaService) {}

  async followBrand(userId: string, brandId: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id: brandId },
    });
    if (!brand) throw new NotFoundException('Brand not found');

    const existing = await this.prisma.followedBrand.findUnique({
      where: { userId_brandId: { userId, brandId } },
    });

    if (existing)
      throw new ConflictException('You are already following this brand');

    return this.prisma.followedBrand.create({
      data: { userId, brandId },
    });
  }

  async unfollowBrand(userId: string, brandId: string) {
    const existing = await this.prisma.followedBrand.findUnique({
      where: { userId_brandId: { userId, brandId } },
    });

    if (!existing)
      throw new NotFoundException('You are not following this brand');

    await this.prisma.followedBrand.delete({
      where: { userId_brandId: { userId, brandId } },
    });

    return { success: true };
  }

  async getMyFollowedBrands(userId: string) {
    return this.prisma.followedBrand.findMany({
      where: { userId },
      include: {
        brand: {
          select: { id: true, name: true, slug: true, logoUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
