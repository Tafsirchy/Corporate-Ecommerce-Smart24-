import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  Min,
  Max,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';

export class CreateReviewDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  comment?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];
}

export class UpdateReviewDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  comment?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];
}
