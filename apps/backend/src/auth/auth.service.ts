import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { authenticator } from 'otplib';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
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
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' })
    };
  }

  async signup(data: Prisma.UserCreateInput) {
    const user = await this.usersService.create(data);
    return this.login(user);
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
    const resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    
    await this.usersService.update(user.id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires
    });
    
    // Mock email for now
    console.log(`\n\n[MOCK EMAIL] To: ${email}\nSubject: Password Reset\nLink: http://localhost:3000/reset-password?token=${resetToken}\n\n`);
    
    return { message: 'Password reset link sent to email' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.usersService.findByResetToken(token);
    
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
