import { Injectable, NotFoundException } from '@nestjs/common';
import { AddressRepository } from '../repositories/address.repository.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AddressesService {
  constructor(private readonly addressRepository: AddressRepository) {}

  async create(userId: string, data: any) {
    // If it's the first address, or they checked a box, handle default setting
    if (data.isDefaultShipping) {
      await this.addressRepository.unsetDefaultShipping(userId);
    }
    if (data.isDefaultBilling) {
      await this.addressRepository.unsetDefaultBilling(userId);
    }

    return this.addressRepository.create({
      ...data,
      user: { connect: { id: userId } }
    });
  }

  async findByUserId(userId: string) {
    return this.addressRepository.findByUserId(userId);
  }

  async update(id: string, userId: string, data: Prisma.AddressUpdateInput) {
    const address = await this.addressRepository.findById(id);
    if (!address || address.userId !== userId) {
      throw new NotFoundException('Address not found');
    }

    if (data.isDefaultShipping) {
      await this.addressRepository.unsetDefaultShipping(userId);
    }
    if (data.isDefaultBilling) {
      await this.addressRepository.unsetDefaultBilling(userId);
    }

    return this.addressRepository.update(id, data);
  }

  async delete(id: string, userId: string) {
    const address = await this.addressRepository.findById(id);
    if (!address || address.userId !== userId) {
      throw new NotFoundException('Address not found');
    }
    return this.addressRepository.delete(id);
  }

  async setDefaultShipping(id: string, userId: string) {
    const address = await this.addressRepository.findById(id);
    if (!address || address.userId !== userId) {
      throw new NotFoundException('Address not found');
    }
    await this.addressRepository.unsetDefaultShipping(userId);
    return this.addressRepository.update(id, { isDefaultShipping: true });
  }

  async setDefaultBilling(id: string, userId: string) {
    const address = await this.addressRepository.findById(id);
    if (!address || address.userId !== userId) {
      throw new NotFoundException('Address not found');
    }
    await this.addressRepository.unsetDefaultBilling(userId);
    return this.addressRepository.update(id, { isDefaultBilling: true });
  }
}
