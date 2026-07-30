import { IsString, IsNumber, IsOptional, IsDateString, Min, Max, IsEnum } from 'class-validator';
import { BusinessType, VerificationLevel } from '@prisma/client';

export class UpdatePricingRuleDto {
  @IsOptional()
  @IsEnum(BusinessType, { message: 'Invalid Business Type' })
  businessType?: BusinessType;

  @IsOptional()
  @IsEnum(VerificationLevel, { message: 'Invalid Verification Level' })
  verificationLevel?: VerificationLevel;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discountPercent?: number;

  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;

  @IsOptional()
  @IsDateString()
  effectiveTo?: string;
}
