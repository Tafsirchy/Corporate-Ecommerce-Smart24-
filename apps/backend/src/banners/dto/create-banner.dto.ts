import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsUrl,
  IsEnum,
} from 'class-validator';
import { BannerType } from '@prisma/client';

export class CreateBannerDto {
  @IsString()
  title: string;

  @IsUrl()
  imageUrl: string;

  @IsOptional()
  @IsString()
  targetUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  order?: number;

  @IsOptional()
  @IsEnum(BannerType)
  type?: BannerType;
}
