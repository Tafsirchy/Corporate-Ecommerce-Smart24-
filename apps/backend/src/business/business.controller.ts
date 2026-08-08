import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Req,
  Body,
  Get,
  Patch,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BusinessService } from './business.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { UploadService } from '../upload/upload.service';

@Controller('business')
export class BusinessController {
  constructor(
    private readonly businessService: BusinessService,
    private readonly uploadService: UploadService,
  ) {}

  @Post('documents')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.BUSINESS)
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body('documentType') documentType: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    if (!documentType) {
      throw new BadRequestException('documentType is required');
    }

    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException(
        'Only image files are allowed for documents currently',
      );
    }

    const fileUrl = await this.uploadService.uploadImageToImgBB(file);
    const userId = req.user?.id || req.user?.userId || req.user?.sub;

    return this.businessService.addDocument(userId, documentType, fileUrl);
  }

  // --- Admin Endpoints ---

  @Get('verifications')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getPendingVerifications(@Req() req: any) {
    return this.businessService.getPendingVerifications(req.query);
  }

  @Patch(':id/verification')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateVerificationStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body('status') status: 'APPROVED' | 'REJECTED',
  ) {
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      throw new BadRequestException('Invalid status');
    }
    const adminId = req.user?.id || req.user?.userId || req.user?.sub;
    return this.businessService.updateVerificationStatus(
      id,
      status,
      adminId,
    );
  }

  @Patch(':id/credit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateCreditLimit(
    @Req() req: any,
    @Param('id') id: string,
    @Body('limit') limit: number,
  ) {
    if (limit < 0) {
      throw new BadRequestException('Credit limit cannot be negative');
    }
    const adminId = req.user?.id || req.user?.userId || req.user?.sub;
    return this.businessService.updateCreditLimit(id, limit, adminId);
  }
}
