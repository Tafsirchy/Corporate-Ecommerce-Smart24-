import { Controller, Post, UseGuards, UseInterceptors, UploadedFile, BadRequestException, Req, Body } from '@nestjs/common';
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

    // Since we're using ImgBB, we only accept images for MVP
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only image files are allowed for documents currently');
    }

    const fileUrl = await this.uploadService.uploadImageToImgBB(file);
    
    return this.businessService.addDocument(req.user.id, documentType, fileUrl);
  }
}
