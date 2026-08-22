import {
  Controller,
  Post,
  Delete,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';

function isValidImage(buffer: Buffer): boolean {
  if (!buffer || buffer.length < 12) return false;
  // JPEG
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return true;
  // PNG
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) return true;
  // GIF
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) return true;
  // WEBP
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) return true;
  return false;
}

@ApiTags('Upload')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ path: 'upload', version: '1' })
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @Roles(Role.ADMIN, Role.BUYER, Role.BUSINESS)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
  }))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type (only images) via client mimetype
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only image files are allowed');
    }

    // Validate file signature (magic bytes) to prevent malicious uploads spoofing mimetype
    if (!isValidImage(file.buffer)) {
      throw new BadRequestException('Invalid image file signature');
    }

    const url = await this.uploadService.uploadImage(file);
    return { url };
  }

  @Delete('image')
  @Roles(Role.ADMIN, Role.BUYER, Role.BUSINESS)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string' }
      }
    }
  })
  async deleteImage(@Body('url') url: string) {
    if (!url) {
      throw new BadRequestException('Image URL is required');
    }

    const success = await this.uploadService.deleteImage(url);
    if (!success) {
      // We don't throw an error here, because if the image is already deleted or not found,
      // we still want to proceed smoothly on the client side.
      return { success: false, message: 'Image could not be deleted from cloud storage' };
    }

    return { success: true };
  }
}
