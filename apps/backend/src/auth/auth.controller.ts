import { Controller, Post, Body, Res, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { SignupDto, LoginDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import type { Response, Request } from 'express';
import * as QRCode from 'qrcode';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() body: SignupDto, @Res({ passthrough: true }) res: Response) {
    const { access_token, refresh_token, user } = await this.authService.signup(body);
    
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/v1/auth/refresh' // Assuming global prefix is /api/v1
    });

    return { access_token, user };
  }

  @Post('login')
  async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.isTwoFactorEnabled) {
      return { 
        twoFactorRequired: true, 
        tempToken: await this.authService.generateTempToken(user) 
      };
    }

    const { access_token, refresh_token } = await this.authService.login(user);

    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/v1/auth/refresh'
    });

    return { access_token, user };
  }

  @Post('verify-2fa-login')
  async verify2faLogin(@Body() body: any, @Res({ passthrough: true }) res: Response) {
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
      path: '/api/v1/auth/refresh'
    });

    return { access_token, user };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('refresh_token', { path: '/api/v1/auth/refresh' });
    return { message: 'Logged out successfully' };
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: any) {
    return this.authService.resetPassword(body.token, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/generate')
  async generateTwoFactorAuth(@Req() req: any) {
    const { secret, otpauthUrl } = await this.authService.generateTwoFactorAuthSecret(req.user);
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
    return { qrCodeDataUrl, secret };
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/turn-on')
  async turnOnTwoFactorAuth(@Req() req: any, @Body('code') code: string) {
    return this.authService.turnOnTwoFactorAuth(req.user, code);
  }
}
