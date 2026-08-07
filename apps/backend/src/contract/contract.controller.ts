import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { ContractService } from './contract.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Controller('contract')
export class ContractController {
  constructor(
    private readonly contractService: ContractService,
    private readonly prisma: PrismaService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.BUSINESS)
  @Post()
  async create(
    @Req() req: any,
    @Body('documentUrl') documentUrl: string,
    @Body('validUntil') validUntil?: Date,
  ) {
    if (!documentUrl) throw new BadRequestException('Document URL is required');
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
      include: { businessProfile: true },
    });
    if (!user || !user.businessProfile) {
      throw new BadRequestException('Business profile not found');
    }
    return this.contractService.create(
      user.businessProfile.id,
      documentUrl,
      validUntil,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.BUSINESS)
  @Get('my-contracts')
  async getMyContracts(@Req() req: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
      include: { businessProfile: true },
    });
    if (!user || !user.businessProfile) {
      return [];
    }
    return this.contractService.findAllByBusiness(user.businessProfile.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.BUSINESS, Role.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contractService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/all')
  findAll() {
    return this.contractService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch('admin/:id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: any) {
    return this.contractService.updateStatus(id, status);
  }
}
