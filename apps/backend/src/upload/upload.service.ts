import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class UploadService {
  async uploadImageToImgBB(file: Express.Multer.File): Promise<string> {
    const apiKey = process.env.IMGBB_API_KEY;
    if (!apiKey) {
      throw new InternalServerErrorException('ImgBB API key is missing');
    }

    const formData = new FormData();
    // ImgBB requires base64 string without the data:image prefix, or a file object.
    // Using base64 is easiest when passing buffer from multer.
    formData.append('image', file.buffer.toString('base64'));

    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (data.success) {
        return data.data.url;
      } else {
        throw new Error(data.error?.message || 'ImgBB upload failed');
      }
    } catch (error: any) {
      throw new InternalServerErrorException(error.message || 'Failed to upload image');
    }
  }
}
