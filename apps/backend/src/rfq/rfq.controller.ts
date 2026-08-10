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
import { RfqService } from './rfq.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { UploadService } from '../upload/upload.service';

@Controller('rfq')
export class RfqController {
  constructor(
    private readonly rfqService: RfqService,
    private readonly uploadService: UploadService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.BUSINESS)
  @UseInterceptors(FileInterceptor('specFile'))
  async createRfq(
    @Req() req: any,
    @Body('productItems') productItemsStr: string,
    @Body('expectedBudget') expectedBudget: string,
    @Body('expectedDate') expectedDate: string,
    @UploadedFile() specFile?: Express.Multer.File,
  ) {
    if (!productItemsStr) {
      throw new BadRequestException('productItems is required');
    }

    let productItems;
    try {
      productItems = JSON.parse(productItemsStr);
    } catch (e) {
      throw new BadRequestException('productItems must be valid JSON');
    }

    let specFileUrl: string | null = null;
    if (specFile) {
      // For MVP we are storing in ImgBB so we assume it's an image
      if (!specFile.mimetype.startsWith('image/')) {
        throw new BadRequestException(
          'Only image specifications are allowed in MVP',
        );
      }
      specFileUrl = await this.uploadService.uploadImageToImgBB(specFile);
    }

    const dto = {
      productItems,
      expectedBudget: expectedBudget ? parseFloat(expectedBudget) : null,
      expectedDate: expectedDate ? new Date(expectedDate) : null,
      specFileUrl,
    };

    return this.rfqService.createRfq(
      req.user?.id || req.user?.userId || req.user?.sub,
      dto,
    );
  }

  @Get('my-rfqs')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.BUSINESS)
  async getMyRfqs(@Req() req: any) {
    return this.rfqService.getBusinessRfqs(
      req.user?.id || req.user?.userId || req.user?.sub,
    );
  }

  // --- Admin Endpoints ---

  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getAllRfqs() {
    return this.rfqService.getAllRfqs();
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateRfqStatus(
    @Param('id') id: string,
    @Body('status') status: any,
    @Body('adminNotes') adminNotes?: string,
  ) {
    if (!status) throw new BadRequestException('Status is required');
    return this.rfqService.updateRfqStatus(id, status, adminNotes);
  }
}
