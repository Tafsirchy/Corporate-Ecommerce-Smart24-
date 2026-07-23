import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { authenticator } from 'otplib';
import * as crypto from 'crypto';
import { Resend } from 'resend';

@Injectable()
export class AuthService {
  private resend: Resend;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {
    if (process.env.RESEND_API_KEY) {
      this.resend = new Resend(process.env.RESEND_API_KEY);
    }
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role, phone: user.phone };
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' })
    };
  }

  async signup(data: Prisma.UserCreateInput) {
    const user = await this.usersService.create(data);
    const tokens = await this.login(user);
    return { ...tokens, user };
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
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    
    await this.usersService.update(user.id, {
      resetPasswordToken: hashedToken,
      resetPasswordExpires
    });
    
    if (this.resend) {
      await this.resend.emails.send({
        from: 'Smart24 Support <onboarding@resend.dev>', // Should be a verified domain in production
        to: email,
        subject: 'Password Reset Request',
        html: `
          <h2>Password Reset Request</h2>
          <p>You requested a password reset. Please click the link below to reset your password:</p>
          <a href="http://localhost:3000/reset-password?token=${resetToken}">Reset Password</a>
          <p>This link will expire in 15 minutes.</p>
          <p>If you didn't request this, you can safely ignore this email.</p>
        `
      });
    } else {
      // Fallback for development if RESEND_API_KEY is missing
      console.log(`\n\n[MOCK EMAIL] To: ${email}\nSubject: Password Reset\nLink: http://localhost:3000/reset-password?token=${resetToken}\n\n`);
    }
    
    return { message: 'Password reset link sent to email' };
  }

  async resetPassword(token: string, newPassword: string) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await this.usersService.findByResetToken(hashedToken);
    
    if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.update(user.id, { 
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null
    });
    
    return { message: 'Password updated successfully' };
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
