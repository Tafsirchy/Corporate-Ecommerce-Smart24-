import { IsString, IsInt, Min, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCartItemDto {
  @ApiProperty({ description: 'The ID of the product' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'The quantity to add/update (0 removes the item)',
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  quantity: number;
}

import { Type } from 'class-transformer';
import { ValidateNested, IsArray } from 'class-validator';

export class MergeCartDto {
  @ApiProperty({ type: [UpdateCartItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateCartItemDto)
  items: UpdateCartItemDto[];
}
