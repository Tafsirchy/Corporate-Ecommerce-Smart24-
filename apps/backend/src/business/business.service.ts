import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BusinessService {
  constructor(private readonly prisma: PrismaService) {}

  async addDocument(userId: string, documentType: string, fileUrl: string) {
    const businessProfile = await this.prisma.businessProfile.findUnique({
      where: { userId },
    });

    if (!businessProfile) {
      throw new NotFoundException('Business profile not found');
    }

    const document = await this.prisma.businessDocument.create({
      data: {
        businessProfileId: businessProfile.id,
        documentType,
        fileUrl,
      },
    });

    // Optionally update verification status to PENDING if it's currently BASIC or REJECTED
    if (businessProfile.verificationStatus !== 'PENDING') {
      await this.prisma.businessProfile.update({
        where: { id: businessProfile.id },
        data: { verificationStatus: 'PENDING' }
      });
    }

    return document;
  }

  async getPendingVerifications() {
    return this.prisma.businessProfile.findMany({
      where: { verificationStatus: 'PENDING' },
      include: {
        documents: true,
        user: { select: { email: true, name: true, phone: true } }
      },
    });
  }

  async updateVerificationStatus(id: string, status: 'APPROVED' | 'REJECTED') {
    const profile = await this.prisma.businessProfile.findUnique({ where: { id } });
    if (!profile) throw new NotFoundException('Business profile not found');

    return this.prisma.businessProfile.update({
      where: { id },
      data: { verificationStatus: status },
    });
  }
}
