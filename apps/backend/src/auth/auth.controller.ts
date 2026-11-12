import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
  SignupDto,
  LoginDto,
  ResetPasswordDto,
  ForgotPasswordDto,
  ResendVerificationDto,
  VerifyEmailDto,
} from './dto/auth.dto';
import { AuthService } from './auth.service';
import type { Response, Request } from 'express';
import * as QRCode from 'qrcode';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  private getRefreshCookieOptions() {
    const isProd = process.env.NODE_ENV === 'production';
    return {
      httpOnly: true,
      secure: isProd,
      sameSite: (isProd ? 'none' : 'lax') as 'none' | 'lax',
      path: '/api/v1/auth/refresh',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    };
  }

  private extractRefreshToken(req: Request): string | undefined {
    const cookies = (req as any).cookies;
    if (cookies?.refresh_token) {
      return cookies.refresh_token;
    }
    const cookieHeader = req.headers?.cookie;
    if (!cookieHeader) return undefined;
    for (const part of cookieHeader.split(';')) {
      const [key, ...valParts] = part.trim().split('=');
      if (key === 'refresh_token') {
        return decodeURIComponent(valParts.join('='));
      }
    }
    return undefined;
  }

  @Post('signup')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async signup(@Body() body: SignupDto) {
    return this.authService.signup(body);
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.isTwoFactorEnabled) {
      return {
        twoFactorRequired: true,
        tempToken: this.authService.generateTempToken(user),
      };
    }

    const { access_token, refresh_token } = this.authService.login(user);

    res.cookie('refresh_token', refresh_token, this.getRefreshCookieOptions());

    return { access_token, user };
  }

  @Post('verify-2fa-login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async verify2faLogin(
    @Body() body: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { tempToken, code } = body;
    const user = await this.authService.verifyTempTokenAndCode(tempToken, code);

    if (!user) {
      throw new UnauthorizedException('Invalid 2FA code or expired session');
    }

    const { access_token, refresh_token } = this.authService.login(user);

    res.cookie('refresh_token', refresh_token, this.getRefreshCookieOptions());

    return { access_token, user };
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = this.extractRefreshToken(req);
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const { access_token, refresh_token } =
      await this.authService.refresh(refreshToken);

    res.cookie('refresh_token', refresh_token, this.getRefreshCookieOptions());

    return { access_token };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(req.user.id);
    const { maxAge: _, ...clearOptions } = this.getRefreshCookieOptions();
    res.clearCookie('refresh_token', clearOptions);
    return { message: 'Logged out successfully' };
  }

  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body.email, body.otp, body.password);
  }

  @Post('verify-email')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async verifyEmail(
    @Body() body: VerifyEmailDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.verifyEmail(body);

    if (result.refresh_token) {
      res.cookie(
        'refresh_token',
        result.refresh_token,
        this.getRefreshCookieOptions(),
      );
    }

    return {
      message: result.message,
      access_token: result.access_token,
      user: result.user,
    };
  }

  @Post('resend-verification')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async resendVerification(@Body() body: ResendVerificationDto) {
    return this.authService.resendVerification(body.email);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/generate')
  async generateTwoFactorAuth(@Req() req: any) {
    const { secret, otpauthUrl } =
      await this.authService.generateTwoFactorAuthSecret(req.user);
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
    return { qrCodeDataUrl, secret };
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/turn-on')
  async turnOnTwoFactorAuth(@Req() req: any, @Body('code') code: string) {
    return this.authService.turnOnTwoFactorAuth(req.user, code);
  }

  @Post('webhooks/resend')
  async resendWebhook(@Body() body: any) {
    // Basic handler for Resend Webhooks (e.g. email bounced)
    if (body?.type === 'email.bounced') {
      console.warn(
        `[WEBHOOK] Email bounced to ${body.data?.to}: ${body.data?.bounce_reason || 'Unknown reason'}`,
      );
      // In a real application, you might mark the user's email as invalid here
    }
    return { received: true };
  }
}
