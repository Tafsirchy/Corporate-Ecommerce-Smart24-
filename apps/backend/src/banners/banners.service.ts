import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { PrismaService } from '../prisma/prisma.service';
import { BannerType } from '@prisma/client';

@Injectable()
export class BannersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createBannerDto: CreateBannerDto) {
    return this.prisma.banner.create({
      data: createBannerDto,
    });
  }

  async findAll(activeOnly = false, type?: BannerType) {
    const where: any = {};
    if (activeOnly) {
      where.isActive = true;
    }
    if (type) {
      where.type = type;
    }

    return this.prisma.banner.findMany({
      where,
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string) {
    const banner = await this.prisma.banner.findUnique({
      where: { id },
    });
    if (!banner) throw new NotFoundException('Banner not found');
    return banner;
  }

  async update(id: string, updateBannerDto: UpdateBannerDto) {
    await this.findOne(id); // Check existence
    return this.prisma.banner.update({
      where: { id },
      data: updateBannerDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.banner.delete({
      where: { id },
    });
  }
}
