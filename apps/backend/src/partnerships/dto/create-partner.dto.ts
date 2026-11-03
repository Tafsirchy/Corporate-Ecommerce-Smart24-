import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PartnerSuppliedItemDto {
  @ApiPropertyOptional({ example: '60d5ecb8b5c9c62b3c8b4567' })
  @IsString()
  @IsOptional()
  productId?: string;

  @ApiProperty({ example: 'Walton Commercial 4K Display 65"' })
  @IsString()
  @IsNotEmpty()
  productName: string;

  @ApiPropertyOptional({ example: 'WLT-DISP-65' })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiPropertyOptional({ example: 'Commercial Displays' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ example: 48000 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({ example: 41000 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  supplyPrice?: number;

  @ApiPropertyOptional({ example: 'In Stock' })
  @IsString()
  @IsOptional()
  availability?: string;

  @ApiPropertyOptional({ example: '3 Years Official Warranty' })
  @IsString()
  @IsOptional()
  warranty?: string;

  @ApiPropertyOptional({ example: 'https://example.com/item.png' })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({ example: 'Direct factory supply with enterprise RMA support' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class PartnerProcurementItemDto {
  @ApiPropertyOptional({ example: '60d5ecb8b5c9c62b3c8b4567' })
  @IsString()
  @IsOptional()
  productId?: string;

  @ApiProperty({ example: '4K Commercial Display Panel 65"' })
  @IsString()
  @IsNotEmpty()
  productName: string;

  @ApiProperty({ example: 50 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 48500 })
  @IsNumber()
  @Min(0)
  purchasePrice: number;

  @ApiPropertyOptional({ example: 2425000 })
  @IsNumber()
  @IsOptional()
  totalAmount?: number;

  @ApiPropertyOptional({ example: '2025-05-15' })
  @IsString()
  @IsOptional()
  purchaseDate?: string;

  @ApiPropertyOptional({ example: 'PO-2025-WLT-042' })
  @IsString()
  @IsOptional()
  invoiceNo?: string;

  @ApiPropertyOptional({ example: 'Initial batch delivery for corporate head office' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreatePartnerDto {
  @ApiProperty({ example: 'Walton Industrial Components' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'walton-industrial-components' })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({ example: 'https://example.com/logo.png' })
  @IsString()
  @IsNotEmpty()
  logoUrl: string;

  @ApiPropertyOptional({ example: 'https://www.waltonbd.com' })
  @IsString()
  @IsOptional()
  websiteUrl?: string;

  @ApiPropertyOptional({ example: 'Electronics & Hardware Manufacturing' })
  @IsString()
  @IsOptional()
  industry?: string;

  @ApiPropertyOptional({ example: 'Strategic Partner' })
  @IsString()
  @IsOptional()
  tier?: string;

  @ApiPropertyOptional({ example: 'Leading electronics manufacturing partner.' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'MoU signed for bulk component supply and warranty service.' })
  @IsString()
  @IsOptional()
  mouDetails?: string;

  @ApiPropertyOptional({ example: ['60d5ecb8b5c9c62b3c8b4567'], type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  suppliedProductIds?: string[];

  @ApiPropertyOptional({ type: [PartnerSuppliedItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PartnerSuppliedItemDto)
  @IsOptional()
  suppliedItems?: PartnerSuppliedItemDto[];

  @ApiPropertyOptional({ example: ['60d5ecb8b5c9c62b3c8b4568'], type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  procuredProductIds?: string[];

  @ApiPropertyOptional({ example: 'Over 2,000 units procured across 4 supply cycles.' })
  @IsString()
  @IsOptional()
  procurementNote?: string;

  @ApiPropertyOptional({ type: [PartnerProcurementItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PartnerProcurementItemDto)
  @IsOptional()
  procuredItems?: PartnerProcurementItemDto[];

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  order?: number;
}
