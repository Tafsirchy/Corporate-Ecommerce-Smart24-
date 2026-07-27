import { IsString, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';
import { RewardType, RewardClaimType, RewardStatus } from '@prisma/client';

export class CreateLoyaltyRewardDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(RewardType)
  type: RewardType;

  @IsEnum(RewardClaimType)
  @IsOptional()
  claimType?: RewardClaimType;

  @IsNumber()
  @Min(0)
  pointCost: number;

  @IsNumber()
  @Min(1)
  minMembershipPriority: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  expiryDays?: number;

  @IsEnum(RewardStatus)
  @IsOptional()
  status?: RewardStatus;
}
