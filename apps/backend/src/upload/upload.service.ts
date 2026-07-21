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
        console.warn(`ImgBB upload failed: ${data.error?.message}. Using placeholder image instead.`);
        return 'https://placehold.co/600x400/eeeeee/333333?text=Review+Image';
      }
    } catch (error: any) {
      console.warn(`Failed to upload image to ImgBB: ${error.message}. Using placeholder image instead.`);
      return 'https://placehold.co/600x400/eeeeee/333333?text=Review+Image';
    }
  }
}
