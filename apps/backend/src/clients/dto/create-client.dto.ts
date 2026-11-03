import { IsString, IsNotEmpty, IsOptional, IsArray, IsBoolean, IsInt, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @IsString()
  @IsNotEmpty()
  logoUrl: string;

  @IsString()
  @IsOptional()
  websiteUrl?: string;

  @IsString()
  @IsOptional()
  industry?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  productIds?: string[];

  @IsString()
  @IsOptional()
  purchaseNote?: string;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isActive?: boolean;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  order?: number;
}

