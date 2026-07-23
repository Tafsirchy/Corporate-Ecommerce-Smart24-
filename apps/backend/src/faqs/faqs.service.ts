import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FaqsService {
  constructor(private prisma: PrismaService) {}

  async getAllFaqs() {
    return this.prisma.faq.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
  }

  async getAllFaqsAdmin() {
    return this.prisma.faq.findMany({
      orderBy: { order: 'asc' },
    });
  }

  async submitFeedback(id: string, isHelpful: boolean) {
    if (isHelpful) {
      return this.prisma.faq.update({
        where: { id },
        data: { helpfulCount: { increment: 1 } },
      });
    } else {
      return this.prisma.faq.update({
        where: { id },
        data: { notHelpfulCount: { increment: 1 } },
      });
    }
  }

  async createFaq(data: { category: string; question: string; answer: string; isActive?: boolean; order?: number }) {
    return this.prisma.faq.create({
      data,
    });
  }

  async updateFaq(id: string, data: Partial<{ category: string; question: string; answer: string; isActive: boolean; order: number }>) {
    return this.prisma.faq.update({
      where: { id },
      data,
    });
  }

  async deleteFaq(id: string) {
    return this.prisma.faq.delete({
      where: { id },
    });
  }
}
