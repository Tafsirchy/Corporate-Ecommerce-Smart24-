import { Injectable, ConflictException } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository.service';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(data: Prisma.UserCreateInput) {
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) {
      throw new ConflictException('Email already in use');
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.userRepository.create({
      ...data,
      password: hashedPassword,
    });
  }

  async findByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  async findById(id: string) {
    return this.userRepository.findById(id);
  }

  async findByResetToken(token: string) {
    return this.userRepository.findByResetToken(token);
  }

  async findByVerificationToken(token: string) {
    return this.userRepository.findByVerificationToken(token);
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return this.userRepository.update(id, data);
  }
}
