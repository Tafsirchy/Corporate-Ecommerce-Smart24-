import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { QuotationRepository } from '../repositories/quotation.repository.service';

@Injectable()
export class QuotationsService {
  constructor(private readonly quotationRepo: QuotationRepository) {}

  async createQuotation(userId: string, data: any) {
    return this.quotationRepo.createQuotation({
      user: { connect: { id: userId } },
      companyName: data.companyName,
      contactNumber: data.contactNumber,
      contactEmail: data.contactEmail,
      quantity: parseInt(data.quantity, 10),
      deliveryLocation: data.deliveryLocation,
      deadline: data.deadline ? new Date(data.deadline) : null,
      instructions: data.instructions,
      ...(data.productId
        ? { product: { connect: { id: data.productId } } }
        : {}),
    });
  }

  async getMyQuotations(
    userId: string,
    query: { page?: number; limit?: number } = {},
  ) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      (this.quotationRepo as any).prisma.quotation.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      (this.quotationRepo as any).prisma.quotation.count({ where: { userId } }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getAllQuotations(query: { page?: number; limit?: number } = {}) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      (this.quotationRepo as any).prisma.quotation.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } } },
      }),
      (this.quotationRepo as any).prisma.quotation.count(),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async respondToQuotation(
    id: string,
    offeredPrice: number,
    adminNotes?: string,
  ) {
    const quote = await this.quotationRepo.findById(id);
    if (!quote) throw new NotFoundException('Quotation not found');

    return this.quotationRepo.updateStatus(id, {
      offeredPrice,
      adminNotes,
      status: 'QUOTED',
    });
  }

  async acceptQuotation(id: string, userId: string) {
    const quote = await this.quotationRepo.findById(id);
    if (!quote) throw new NotFoundException('Quotation not found');
    if (quote.userId !== userId) throw new NotFoundException('Not authorized');
    if (quote.status !== 'QUOTED') {
      throw new ConflictException(
        'You can only accept quotations that have been quoted by an admin',
      );
    }

    // In a full flow, accepting this would generate a PENDING Order based on the offeredPrice.
    // For now, we simply update the status to ACCEPTED.
    return this.quotationRepo.updateStatus(id, { status: 'ACCEPTED' });
  }

  async rejectQuotation(id: string, userId: string) {
    const quote = await this.quotationRepo.findById(id);
    if (!quote) throw new NotFoundException('Quotation not found');
    if (quote.userId !== userId) throw new NotFoundException('Not authorized');
    if (quote.status !== 'QUOTED' && quote.status !== 'PENDING') {
      throw new ConflictException(
        'You cannot reject a quotation in its current status',
      );
    }

    return this.quotationRepo.updateStatus(id, { status: 'REJECTED' });
  }
}
