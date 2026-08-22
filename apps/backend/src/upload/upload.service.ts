import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class UploadService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(file: Express.Multer.File): Promise<string> {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      throw new InternalServerErrorException('Cloudinary credentials are not configured');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'corporate-ecommerce',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            reject(new InternalServerErrorException(`Cloudinary upload failed: ${error.message}`));
          } else if (result) {
            resolve(result.secure_url);
          } else {
            reject(new InternalServerErrorException('Unknown error during upload'));
          }
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async deleteImage(imageUrl: string): Promise<boolean> {
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      throw new InternalServerErrorException('Cloudinary credentials are not configured');
    }

    try {
      // Extract public ID from Cloudinary URL
      // Example: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/corporate-ecommerce/filename.jpg
      const urlParts = imageUrl.split('/');
      const filename = urlParts[urlParts.length - 1];
      const folder = urlParts[urlParts.length - 2];
      
      if (!filename || !folder) return false;
      
      const publicId = `${folder}/${filename.split('.')[0]}`;

      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === 'ok';
    } catch (error) {
      console.error('Failed to delete image from Cloudinary:', error);
      return false;
    }
  }
}
