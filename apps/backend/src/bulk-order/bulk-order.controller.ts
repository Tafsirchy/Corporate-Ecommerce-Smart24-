import { Controller, Post, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BulkOrderService } from './bulk-order.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('bulk-order')
export class BulkOrderController {
  constructor(private readonly bulkOrderService: BulkOrderService) {}

  @Post('validate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.BUSINESS)
  @UseInterceptors(FileInterceptor('file'))
  async validateCsv(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No CSV file uploaded');
    }
    
    // Very basic CSV text extraction since file.buffer is populated by multer MemoryStorage by default
    const csvContent = file.buffer.toString('utf8');
    return this.bulkOrderService.validateCsv(csvContent);
  }
}
