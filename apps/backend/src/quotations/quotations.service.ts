import { Injectable, NotFoundException } from '@nestjs/common';
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

  async getMyQuotations(userId: string) {
    return this.quotationRepo.findByUserId(userId);
  }

  async getAllQuotations() {
    return this.quotationRepo.findAll();
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

    // In a full flow, accepting this would generate a PENDING Order based on the offeredPrice.
    // For now, we simply update the status to ACCEPTED.
    return this.quotationRepo.updateStatus(id, { status: 'ACCEPTED' });
  }

  async rejectQuotation(id: string, userId: string) {
    const quote = await this.quotationRepo.findById(id);
    if (!quote) throw new NotFoundException('Quotation not found');
    if (quote.userId !== userId) throw new NotFoundException('Not authorized');

    return this.quotationRepo.updateStatus(id, { status: 'REJECTED' });
  }
}
