import { Controller, Get, Patch, Body, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: any) {
    if (!req.user) {
      throw new UnauthorizedException();
    }
    const user = await this.usersService.findById(req.user.id);
    if (!user) {
      throw new UnauthorizedException();
    }
    const { password, twoFactorSecret, ...result } = user;
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(@Req() req: any, @Body() updateData: any) {
    if (!req.user) {
      throw new UnauthorizedException();
    }

    const allowedUpdates: any = {
      name: updateData.name,
      phone: updateData.phone,
      gender: updateData.gender,
      birthday: updateData.birthday,
    };
    
    // Remove undefined fields
    Object.keys(allowedUpdates).forEach(key => 
      allowedUpdates[key] === undefined && delete allowedUpdates[key]
    );

    const user = await this.usersService.update(req.user.id, allowedUpdates);
    const { password, twoFactorSecret, ...result } = user;
    return result;
  }
}
