import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Prisma, User } from '@prisma/client';
import { authenticator } from 'otplib';
import * as crypto from 'crypto';
import { EmailService } from '../common/email/email.service';

const IV_LENGTH = 12; // For AES-GCM
const ALGORITHM = 'aes-256-gcm';
const getEncryptionKey = () => {
  const secret =
    process.env.ENCRYPTION_KEY || 'default_secret_key_change_me_in_prod';
  return crypto.scryptSync(secret, 'salt', 32);
};

const encryptSecret = (text: string) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
};

const decryptSecret = (encryptedText: string) => {
  if (!encryptedText || !encryptedText.includes(':')) return encryptedText; // Fallback for old plaintext
  try {
    const [ivHex, authTagHex, encrypted] = encryptedText.split(':');
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      getEncryptionKey(),
      Buffer.from(ivHex, 'hex'),
    );
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch {
    return encryptedText; // Fallback in case of corruption
  }
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const normalizedEmail = email?.trim().toLowerCase();
    const user = await this.usersService.findByEmail(normalizedEmail);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  login(user: User) {
    if (!user.isEmailVerified) {
      throw new UnauthorizedException(
        'Please verify your email address before logging in.',
      );
    }

    // Include tokenVersion in payload for session invalidation on password reset
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      phone: user.phone,
      version: user.tokenVersion || 0,
    };
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '30d' }),
    };
  }

  async refresh(refreshToken: string) {
    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.isActive || !user.isEmailVerified) {
      throw new UnauthorizedException('Invalid or inactive user');
    }

    if (
      payload.version !== undefined &&
      user.tokenVersion !== payload.version
    ) {
      throw new UnauthorizedException('Session expired or revoked');
    }

    return this.login(user);
  }

  async logout(userId: string) {
    const user = await this.usersService.findById(userId);
    if (user) {
      const nextTokenVersion = (user.tokenVersion || 0) + 1;
      await this.usersService.update(userId, {
        tokenVersion: nextTokenVersion,
      });
    }
  }

  async signup(data: Record<string, any>) {
    const email = data.email?.trim().toLowerCase();
    const rawOtp = crypto.randomInt(100000, 1000000).toString();
    const hashedOtp = crypto.createHash('sha256').update(rawOtp).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const createData: Prisma.UserCreateInput = {
      email,
      password: data.password,
      name: data.name?.trim(),
      phone: data.phone?.trim(),
      role: 'BUYER',
      isEmailVerified: false,
      verificationToken: hashedOtp,
      verificationTokenExpires: expiresAt,
    };

    if (data.role === 'BUSINESS' && data.businessProfile) {
      createData.role = 'BUSINESS';
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

    // Trigger verification email in background with error catching
    this.emailService.sendVerificationEmail(user.email, rawOtp).catch((err) => {
      this.logger.error(
        `Failed to send verification email to ${user.email}: ${err.message || err}`,
      );
    });

    return {
      message:
        'Registration successful. Please check your email for the verification code or confirmation link.',
      userId: user.id,
    };
  }

  async verifyEmail(dto: { email?: string; otp?: string; token?: string }) {
    const email = dto.email?.trim().toLowerCase();
    const code = (dto.otp || dto.token)?.trim();

    if (!code && !email) {
      throw new BadRequestException('Verification code or link is required');
    }

    let user: User | null = null;

    if (email) {
      user = await this.usersService.findByEmail(email);
    } else if (code) {
      const hashedCode = crypto
        .createHash('sha256')
        .update(code)
        .digest('hex');
      user = await this.usersService.findByVerificationToken(hashedCode);
      if (!user) {
        user = await this.usersService.findByVerificationToken(code);
      }
    }

    if (!user) {
      throw new BadRequestException('Invalid or expired verification request');
    }
    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    if (!code) {
      throw new BadRequestException('Verification code is required');
    }

    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

    if (
      (user.verificationToken !== hashedCode &&
        user.verificationToken !== code) ||
      !user.verificationTokenExpires ||
      user.verificationTokenExpires < new Date()
    ) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    await this.usersService.update(user.id, {
      isEmailVerified: true,
      verificationToken: null,
      verificationTokenExpires: null,
    });

    // Update user in memory so login() passes verification check
    user.isEmailVerified = true;

    const { access_token, refresh_token } = this.login(user);
    const { password, ...userWithoutPassword } = user;

    // Send welcome email in background
    if (user.emailNotifications) {
      this.emailService
        .sendWelcomeEmail(user.email, user.name)
        .catch((err) =>
          this.logger.error(
            `Failed to send welcome email to ${user.email}: ${err.message || err}`,
          ),
        );
    }

    return {
      message: 'Email successfully verified. You are now logged in.',
      access_token,
      refresh_token,
      user: userWithoutPassword,
    };
  }

  async resendVerification(email: string) {
    const normalizedEmail = email?.trim().toLowerCase();
    const user = await this.usersService.findByEmail(normalizedEmail);
    // Silent return to prevent enumeration
    if (!user) {
      return {
        message:
          'If this email is registered, a verification code has been sent.',
      };
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified.');
    }

    const rawOtp = crypto.randomInt(100000, 1000000).toString();
    const hashedOtp = crypto.createHash('sha256').update(rawOtp).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await this.usersService.update(user.id, {
      verificationToken: hashedOtp,
      verificationTokenExpires: expiresAt,
    });

    this.emailService
      .sendVerificationEmail(user.email, rawOtp)
      .catch((err) => {
        this.logger.error(
          `Failed to resend verification email to ${user.email}: ${err.message || err}`,
        );
      });

    return {
      message:
        'If this email is registered, a verification code has been sent.',
    };
  }

  generateTempToken(user: User) {
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
    } catch {
      return null;
    }
  }

  async forgotPassword(email: string) {
    const normalizedEmail = email?.trim().toLowerCase();
    const user = await this.usersService.findByEmail(normalizedEmail);
    // User enumeration prevention
    if (!user) {
      return {
        message:
          'If this email is registered, you will receive a password reset link.',
      };
    }

    const rawOtp = crypto.randomInt(100000, 1000000).toString();
    const hashedOtp = crypto.createHash('sha256').update(rawOtp).digest('hex');
    const resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await this.usersService.update(user.id, {
      resetPasswordToken: hashedOtp,
      resetPasswordExpires,
    });

    this.emailService
      .sendPasswordResetEmail(user.email, rawOtp)
      .catch((err) => {
        this.logger.error(
          `Failed to send reset email to ${user.email}: ${err.message || err}`,
        );
      });

    return {
      message:
        'If this email is registered, you will receive a password reset link.',
    };
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    const normalizedEmail = email?.trim().toLowerCase();
    const user = await this.usersService.findByEmail(normalizedEmail);

    if (!user) {
      throw new BadRequestException('Invalid or expired token');
    }

    const trimmedOtp = otp?.trim();
    const hashedOtp = crypto
      .createHash('sha256')
      .update(trimmedOtp)
      .digest('hex');

    if (
      (user.resetPasswordToken !== hashedOtp &&
        user.resetPasswordToken !== trimmedOtp) ||
      !user.resetPasswordExpires ||
      user.resetPasswordExpires < new Date()
    ) {
      throw new BadRequestException('Invalid or expired token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    // Increment tokenVersion to invalidate existing JWT sessions
    const nextTokenVersion = (user.tokenVersion || 0) + 1;

    await this.usersService.update(user.id, {
      password: hashedPassword,
      tokenVersion: nextTokenVersion,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    // Send security alert in background
    if (user.emailNotifications !== false) {
      this.emailService
        .sendPasswordChangedAlert(user.email, user.name)
        .catch((err) =>
          this.logger.error(
            `Failed to send password changed alert to ${user.email}: ${err.message || err}`,
          ),
        );
    }

    return {
      message: 'Password has been successfully reset',
    };
  }

  async generateTwoFactorAuthSecret(user: User) {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(user.email, 'Smart24', secret);
    await this.usersService.update(user.id, {
      twoFactorSecret: encryptSecret(secret),
    });
    return { secret, otpauthUrl };
  }

  async verifyTwoFactorAuthCode(user: User, code: string) {
    const dbUser = await this.usersService.findById(user.id);
    if (!dbUser || !dbUser.twoFactorSecret) {
      return false;
    }
    const decryptedSecret = decryptSecret(dbUser.twoFactorSecret);
    return authenticator.verify({
      token: code,
      secret: decryptedSecret,
    });
  }

  async turnOnTwoFactorAuth(user: User, code: string) {
    const isCodeValid = await this.verifyTwoFactorAuthCode(user, code);
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    await this.usersService.update(user.id, { isTwoFactorEnabled: true });
    return { message: '2FA enabled successfully' };
  }
}
