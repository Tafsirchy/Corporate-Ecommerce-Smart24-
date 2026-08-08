import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsEmail,
  IsEnum,
} from 'class-validator';
import { PaymentMethod } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ description: 'Shipping address for the order' })
  @IsString()
  @IsNotEmpty()
  shippingAddress: string;

  @ApiProperty({ description: 'Contact number for the order' })
  @IsString()
  @IsNotEmpty()
  contactNumber: string;

  @ApiPropertyOptional({
    description: 'Whether to save the address for future use',
  })
  @IsOptional()
  @IsBoolean()
  saveAddress?: boolean;

  @ApiProperty({ description: 'Payment method selected', enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({ description: 'Transaction ID for manual payments' })
  @IsOptional()
  @IsString()
  paymentTrxId?: string;

  @ApiPropertyOptional({ description: 'Payment proof URL for manual payments' })
  @IsOptional()
  @IsString()
  paymentProofUrl?: string;

  @ApiPropertyOptional({
    description: 'Payment account number for manual payments',
  })
  @IsOptional()
  @IsString()
  paymentAccountNumber?: string;

  @ApiPropertyOptional({ description: 'Guest email address' })
  @IsOptional()
  @IsEmail()
  guestEmail?: string;

  @ApiPropertyOptional({ description: 'Guest name' })
  @IsOptional()
  @IsString()
  guestName?: string;

  @ApiPropertyOptional({ description: 'Promo code or coupon' })
  @IsOptional()
  @IsString()
  promoCode?: string;
}
