import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsDateString,
  ValidateIf,
} from 'class-validator';
import { OfferType, DiscountType } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateOfferDto {
  @IsString()
  name: string;

  @IsEnum(OfferType)
  type: OfferType;

  @IsEnum(DiscountType)
  discountType: DiscountType;

  @IsNumber()
  @Type(() => Number)
  discountValue: number;

  @ValidateIf((o) => o.type === OfferType.AMOUNT_BASED)
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minAmount?: number;

  @ValidateIf((o) => o.type === OfferType.AMOUNT_BASED)
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  priority?: number;

  @ValidateIf((o) => o.type === OfferType.FIXED_PACKAGE)
  @IsString()
  planId?: string;

  @IsOptional()
  @IsBoolean()
  isFreeDelivery?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
