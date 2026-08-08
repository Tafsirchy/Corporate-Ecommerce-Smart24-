import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsObject,
  ValidateNested,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FilterType, FilterStatus } from '@prisma/client';

class FilterValueDto {
  @IsString()
  value: string;

  @IsString()
  label: string;

  @IsBoolean()
  @IsOptional()
  autoDetected?: boolean;

  @IsString()
  @IsOptional()
  colorHex?: string;
}

class RangeConfigDto {
  @IsNumber()
  min: number;

  @IsNumber()
  max: number;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsNumber()
  @IsOptional()
  step?: number;
}

export class CreateFilterDto {
  @IsString()
  key: string;

  @IsString()
  label: string;

  @IsEnum(FilterType)
  type: FilterType;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  categoryIds?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FilterValueDto)
  @IsOptional()
  values?: FilterValueDto[];

  @IsObject()
  @ValidateNested()
  @Type(() => RangeConfigDto)
  @IsOptional()
  rangeConfig?: RangeConfigDto;

  @IsEnum(FilterStatus)
  @IsOptional()
  status?: FilterStatus;

  @IsNumber()
  @IsOptional()
  displayOrder?: number;
}
