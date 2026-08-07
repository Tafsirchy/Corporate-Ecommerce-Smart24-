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

    // Mock Service Logic: Auto-approve or flag based on fileUrl keywords
    let nextStatus: 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' = 'PENDING';

    if (fileUrl.includes('mock-approve-nid')) {
      nextStatus = 'VERIFIED';
    } else if (fileUrl.includes('mock-flag-nid')) {
      nextStatus = 'UNDER_REVIEW';
    }

    if (businessProfile.verificationStatus !== nextStatus) {
      await this.prisma.businessProfile.update({
        where: { id: businessProfile.id },
        data: { verificationStatus: nextStatus },
      });
    }

    return document;
  }

  async getPendingVerifications() {
    return this.prisma.businessProfile.findMany({
      where: { verificationStatus: 'PENDING' },
      include: {
        documents: true,
        user: { select: { email: true, name: true, phone: true } },
      },
    });
  }

  async updateVerificationStatus(
    id: string,
    status: 'APPROVED' | 'REJECTED',
    adminId?: string,
  ) {
    const profile = await this.prisma.businessProfile.findUnique({
      where: { id },
    });
    if (!profile) throw new NotFoundException('Business profile not found');

    const updated = await this.prisma.businessProfile.update({
      where: { id },
      data: {
        verificationStatus: status === 'APPROVED' ? 'VERIFIED' : 'REJECTED',
      },
    });

    if (adminId) {
      await this.prisma.auditLog.create({
        data: {
          adminId,
          action: 'UPDATE_VERIFICATION_STATUS',
          targetType: 'BusinessProfile',
          targetId: id,
          reason: `Changed status to ${status}`,
        },
      });
    }

    return updated;
  }

  async updateCreditLimit(id: string, limit: number, adminId: string) {
    const profile = await this.prisma.businessProfile.findUnique({
      where: { id },
    });
    if (!profile) throw new NotFoundException('Business profile not found');

    const updated = await this.prisma.businessProfile.update({
      where: { id },
      data: { creditLimit: limit },
    });

    await this.prisma.auditLog.create({
      data: {
        adminId,
        action: 'UPDATE_CREDIT_LIMIT',
        targetType: 'BusinessProfile',
        targetId: id,
        reason: `Changed credit limit from ${profile.creditLimit} to ${limit}`,
      },
    });

    return updated;
  }
}
