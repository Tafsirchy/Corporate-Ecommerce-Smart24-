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
import { SignupDto, LoginDto, ResetPasswordDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import type { Response, Request } from 'express';
import * as QRCode from 'qrcode';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

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
        tempToken: await this.authService.generateTempToken(user),
      };
    }

    const { access_token, refresh_token } = await this.authService.login(user);

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/v1/auth/refresh',
    });

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

    const { access_token, refresh_token } = await this.authService.login(user);

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/v1/auth/refresh',
    });

    return { access_token, user };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(req.user.id);
    res.clearCookie('refresh_token', { path: '/api/v1/auth/refresh' });
    return { message: 'Logged out successfully' };
  }

  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body.token, body.password);
  }

  @Post('verify-email')
  async verifyEmail(
    @Body('token') token: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.verifyEmail(token);
    
    if (result.refresh_token) {
      res.cookie('refresh_token', result.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/api/v1/auth/refresh',
      });
    }

    return { 
      message: result.message, 
      access_token: result.access_token, 
      user: result.user 
    };
  }

  @Post('resend-verification')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async resendVerification(@Body('email') email: string) {
    return this.authService.resendVerification(email);
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
      console.warn(`[WEBHOOK] Email bounced to ${body.data?.to}: ${body.data?.bounce_reason || 'Unknown reason'}`);
      // In a real application, you might mark the user's email as invalid here
    }
    return { received: true };
  }
}
