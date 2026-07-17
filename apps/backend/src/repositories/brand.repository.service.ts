import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Brand } from '@prisma/client';

@Injectable()
export class BrandRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.BrandCreateInput): Promise<Brand> {
    return this.prisma.brand.create({ data });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.BrandWhereUniqueInput;
    where?: Prisma.BrandWhereInput;
    orderBy?: Prisma.BrandOrderByWithRelationInput;
  }): Promise<Brand[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.brand.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async findById(id: string): Promise<Brand | null> {
    return this.prisma.brand.findUnique({
      where: { id },
    });
  }

  async findBySlug(slug: string): Promise<Brand | null> {
    return this.prisma.brand.findUnique({
      where: { slug },
    });
  }

  async update(id: string, data: Prisma.BrandUpdateInput): Promise<Brand> {
    return this.prisma.brand.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Brand> {
    return this.prisma.brand.delete({
      where: { id },
    });
  }
}
