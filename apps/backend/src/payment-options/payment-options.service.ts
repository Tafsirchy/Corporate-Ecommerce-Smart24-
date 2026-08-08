import { Injectable, NotFoundException } from '@nestjs/common';
import { PaymentOptionRepository } from '../repositories/payment-option.repository.service';

@Injectable()
export class PaymentOptionsService {
  constructor(private readonly paymentOptionRepo: PaymentOptionRepository) {}

  async create(userId: string, data: any) {
    // Check if already exists
    const existing =
      await this.paymentOptionRepo.findByUserIdAndProviderAndAccountNumber(
        userId,
        data.provider,
        data.accountNumber,
      );
    if (existing) {
      return existing; // Already saved
    }

    return this.paymentOptionRepo.create({
      provider: data.provider,
      accountNumber: data.accountNumber,
      isDefault: data.isDefault || false,
      user: { connect: { id: userId } },
    });
  }

  async findByUserId(userId: string) {
    return this.paymentOptionRepo.findByUserId(userId);
  }

  async delete(id: string, userId: string) {
    const paymentOption = await this.paymentOptionRepo.findById(id);
    if (!paymentOption || paymentOption.userId !== userId) {
      throw new NotFoundException('Payment option not found');
    }
    return this.paymentOptionRepo.delete(id);
  }
}
