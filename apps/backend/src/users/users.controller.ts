import {
  Controller,
  Get,
  Patch,
  Body,
  Req,
  Param,
  Delete,
  Query,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Req() req: any) {
    if (!req.user) {
      throw new UnauthorizedException();
    }
    const user = await this.usersService.findById((req.user?.id || req.user?.userId || req.user?.sub));
    if (!user) {
      throw new UnauthorizedException();
    }
    const { password, twoFactorSecret, ...result } = user;
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(@Req() req: any, @Body() updateData: UpdateProfileDto) {
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
    Object.keys(allowedUpdates).forEach(
      (key) => allowedUpdates[key] === undefined && delete allowedUpdates[key],
    );

    const user = await this.usersService.update((req.user?.id || req.user?.userId || req.user?.sub), allowedUpdates);
    const { password, twoFactorSecret, ...result } = user;
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me')
  async deleteAccount(@Req() req: any) {
    if (!req.user) throw new UnauthorizedException();
    await this.usersService.delete((req.user?.id || req.user?.userId || req.user?.sub));
    return { message: 'Account deleted successfully' };
  }

  // --- Admin Endpoints ---

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.usersService.findAll(page, limit);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/role')
  async updateRole(@Param('id') id: string, @Body('role') role: string) {
    const user = await this.usersService.update(id, { role: role as any });
    const { password, twoFactorSecret, ...result } = user as any;
    return result;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    await this.usersService.delete(id);
    return { message: 'User deleted successfully' };
  }
}
