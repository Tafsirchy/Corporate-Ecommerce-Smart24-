import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { authenticator } from 'otplib';
import * as crypto from 'crypto';
import { EmailService } from '../common/email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Please verify your email address before logging in.');
    }
    
    // Include tokenVersion in payload for session invalidation on password reset
    const payload = { 
      email: user.email, 
      sub: user.id, 
      role: user.role, 
      phone: user.phone,
      version: user.tokenVersion || 0 
    };
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' })
    };
  }

  async signup(data: any) {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    const createData: Prisma.UserCreateInput = {
      email: data.email,
      password: data.password,
      name: data.name,
      phone: data.phone,
      role: data.role || 'BUYER',
      isEmailVerified: false,
      verificationToken: hashedToken,
      verificationTokenExpires: expiresAt
    };

    if (data.role === 'BUSINESS' && data.businessProfile) {
      createData.businessProfile = {
        create: {
          businessType: data.businessProfile.businessType,
          businessName: data.businessProfile.businessName,
          ownerName: data.businessProfile.ownerName,
          address: data.businessProfile.address,
        },
      };
    }

    const user = await this.usersService.create(createData);
    
    // Trigger verification email in background
    this.emailService.sendVerificationEmail(user.email, rawToken).catch(err => {
      console.error('Failed to send verification email during signup:', err);
    });
    
    return { 
      message: 'Registration successful. Please check your email to verify your account.', 
      userId: user.id 
    };
  }

  async verifyEmail(token: string) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await this.usersService.findByVerificationToken(hashedToken);
    
    if (!user || !user.verificationTokenExpires || user.verificationTokenExpires < new Date()) {
      throw new BadRequestException('Invalid or expired verification token');
    }
    
    await this.usersService.update(user.id, {
      isEmailVerified: true,
      verificationToken: null,
      verificationTokenExpires: null
    });
    
    return { message: 'Email successfully verified. You can now log in.' };
  }

  async resendVerification(email: string) {
    const user = await this.usersService.findByEmail(email);
    // Silent return to prevent enumeration
    if (!user) return { message: 'If this email is registered, a verification link has been sent.' };
    
    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified.');
    }
    
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    await this.usersService.update(user.id, {
      verificationToken: hashedToken,
      verificationTokenExpires: expiresAt
    });
    
    this.emailService.sendVerificationEmail(user.email, rawToken).catch(err => {
      console.error('Failed to resend verification email:', err);
    });
    
    return { message: 'If this email is registered, a verification link has been sent.' };
  }

  async generateTempToken(user: any) {
    const payload = { sub: user.id, temp: true };
    return this.jwtService.sign(payload, { expiresIn: '5m' });
  }

  async verifyTempTokenAndCode(tempToken: string, code: string) {
    try {
      const payload = this.jwtService.verify(tempToken);
      if (!payload.temp) return null;
      
      const user = await this.usersService.findById(payload.sub);
      if (!user) return null;

      const isCodeValid = await this.verifyTwoFactorAuthCode(user, code);
      if (!isCodeValid) return null;

      return user;
    } catch (e) {
      return null;
    }
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    // User enumeration prevention
    if (!user) {
      return { message: 'If this email is registered, you will receive a password reset link.' };
    }
    
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    
    await this.usersService.update(user.id, {
      resetPasswordToken: hashedToken,
      resetPasswordExpires
    });
    
    this.emailService.sendPasswordResetEmail(user.email, resetToken).catch(err => {
      console.error('Failed to send reset email:', err);
    });
    
    return { message: 'If this email is registered, you will receive a password reset link.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await this.usersService.findByResetToken(hashedToken);
    
    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      throw new BadRequestException('Invalid or expired token');
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    // Increment tokenVersion to invalidate existing JWT sessions
    const nextTokenVersion = (user.tokenVersion || 0) + 1;
    
    await this.usersService.update(user.id, { 
      password: hashedPassword,
      tokenVersion: nextTokenVersion,
      resetPasswordToken: null,
      resetPasswordExpires: null
    });
    
    return { message: 'Password updated successfully. All other sessions have been logged out.' };
  }

  async generateTwoFactorAuthSecret(user: any) {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(user.email, 'Smart24', secret);
    await this.usersService.update(user.id, { twoFactorSecret: secret });
    return { secret, otpauthUrl };
  }

  async verifyTwoFactorAuthCode(user: any, code: string) {
    const dbUser = await this.usersService.findById(user.id);
    if (!dbUser || !dbUser.twoFactorSecret) {
      return false;
    }
    return authenticator.verify({ token: code, secret: dbUser.twoFactorSecret });
  }

  async turnOnTwoFactorAuth(user: any, code: string) {
    const isCodeValid = await this.verifyTwoFactorAuthCode(user, code);
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    await this.usersService.update(user.id, { isTwoFactorEnabled: true });
    return { message: '2FA enabled successfully' };
  }
}
