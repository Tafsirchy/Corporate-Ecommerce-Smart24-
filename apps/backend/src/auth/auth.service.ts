import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { authenticator } from 'otplib';

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

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const payload = { sub: user.id, reset: true };
    const resetToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    return { message: 'Password reset link sent to email', resetToken };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const payload = this.jwtService.verify(token);
      if (!payload.reset) {
        throw new UnauthorizedException('Invalid token type');
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await this.usersService.update(payload.sub, { password: hashedPassword });
      return { message: 'Password updated successfully' };
    } catch (e) {
      throw new UnauthorizedException('Invalid or expired token');
    }
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
