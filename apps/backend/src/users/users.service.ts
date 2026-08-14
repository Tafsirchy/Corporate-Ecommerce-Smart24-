import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository.service';
import { EmailService } from '../common/email/email.service';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
  ) {}

  async create(data: Prisma.UserCreateInput) {
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) {
      throw new ConflictException('Email already in use');
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    try {
      return await this.userRepository.create({
        ...data,
        password: hashedPassword,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email already in use');
      }
      throw error;
    }
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

  async findAll(pageStr?: string, limitStr?: string) {
    const page = pageStr ? parseInt(pageStr, 10) : 1;
    const limit = limitStr ? parseInt(limitStr, 10) : 20;
    const skip = (page - 1) * limit;

    const result = await this.userRepository.findAll(skip, limit);
    return {
      data: result.data.map(
        ({ password: _password, twoFactorSecret: _twoFactorSecret, ...rest }) =>
          rest,
      ),
      meta: {
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }

  async delete(id: string) {
    return this.userRepository.update(id, {
      name: 'Deleted User',
      email: `deleted_${id}_${Date.now()}@deleted.local`,
      phone: null,
      isActive: false,
    });
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (
      !user.password ||
      !(await bcrypt.compare(currentPassword, user.password))
    ) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(userId, {
      password: hashedPassword,
    });

    // Send security alert in background
    if (user.emailNotifications !== false) {
      this.emailService
        .sendPasswordChangedAlert(user.email, user.name)
        .catch((err) =>
          console.error('Failed to send password changed alert:', err),
        );
    }

    return { message: 'Password changed successfully' };
  }
}
