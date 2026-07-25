import { IsString, IsOptional, IsNotEmpty, IsNumber, IsMongoId, IsArray } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsNumber()
  stock?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsNotEmpty()
  @IsMongoId()
  categoryId: string;

  @IsOptional()
  @IsMongoId()
  brandId?: string;

  @IsOptional()
  @IsArray()
  attributes?: any[];
}
