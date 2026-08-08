import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SubscriptionStatus } from '@prisma/client';

export class SubscriptionItemDto {
  @IsString()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class CreateSubscriptionPlanDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubscriptionItemDto)
  items: SubscriptionItemDto[];
}

import { PartialType } from '@nestjs/swagger';

export class UpdateSubscriptionPlanDto extends PartialType(
  CreateSubscriptionPlanDto,
) {}

export class CreateCustomSubscriptionDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubscriptionItemDto)
  items: SubscriptionItemDto[];

  @IsString()
  deliveryAddress: string;

  @IsString()
  contactNumber: string;

  @IsNumber()
  @Min(1)
  billingDay: number;

  @IsString()
  @IsOptional()
  paymentMethod?: string;
}

export class CreateFixedSubscriptionDto {
  @IsString()
  planId: string;

  @IsString()
  deliveryAddress: string;

  @IsString()
  contactNumber: string;

  @IsNumber()
  @Min(1)
  billingDay: number;

  @IsString()
  @IsOptional()
  paymentMethod?: string;
}

export class UpdateSubscriptionStatusDto {
  @IsEnum(SubscriptionStatus)
  status: SubscriptionStatus;
}
