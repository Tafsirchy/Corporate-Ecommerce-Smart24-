import { IsString, IsOptional, IsBoolean, IsInt, IsUrl } from 'class-validator';

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
}
