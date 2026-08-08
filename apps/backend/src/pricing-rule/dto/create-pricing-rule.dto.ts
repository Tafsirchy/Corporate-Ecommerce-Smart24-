import {
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  Min,
  Max,
  IsEnum,
} from 'class-validator';
import { BusinessType, VerificationLevel } from '@prisma/client';

export class CreatePricingRuleDto {
  @IsOptional()
  @IsEnum(BusinessType, { message: 'Invalid Business Type' })
  businessType?: BusinessType;

  @IsOptional()
  @IsEnum(VerificationLevel, { message: 'Invalid Verification Level' })
  verificationLevel?: VerificationLevel;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercent: number;

  @IsDateString()
  effectiveFrom: string;

  @IsOptional()
  @IsDateString()
  effectiveTo?: string;
}
