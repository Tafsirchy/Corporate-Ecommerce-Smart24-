import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { SavedListService } from './saved-list.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Controller('saved-list')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.BUSINESS)
export class SavedListController {
  constructor(
    private readonly savedListService: SavedListService,
    private readonly prisma: PrismaService,
  ) {}

  private async getBusinessId(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { businessProfile: true },
    });
    if (!user || !user.businessProfile)
      throw new UnauthorizedException('Not a business account');
    return user.businessProfile.id;
  }

  @Post()
  async create(@Req() req: any, @Body() createSavedListDto: any) {
    const businessId = await this.getBusinessId(
      req.user?.id || req.user?.userId || req.user?.sub,
    );
    return this.savedListService.create(createSavedListDto, businessId);
  }

  @Get()
  async findAll(@Req() req: any) {
    const businessId = await this.getBusinessId(
      req.user?.id || req.user?.userId || req.user?.sub,
    );
    return this.savedListService.findAllByBusiness(businessId);
  }

  @Get(':id')
  async findOne(@Req() req: any, @Param('id') id: string) {
    const businessId = await this.getBusinessId(
      req.user?.id || req.user?.userId || req.user?.sub,
    );
    return this.savedListService.findOne(id, businessId);
  }

  @Delete(':id')
  async remove(@Req() req: any, @Param('id') id: string) {
    const businessId = await this.getBusinessId(
      req.user?.id || req.user?.userId || req.user?.sub,
    );
    return this.savedListService.remove(id, businessId);
  }
}
