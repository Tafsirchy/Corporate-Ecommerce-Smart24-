import {
  IsString,
  IsOptional,
  IsMongoId,
  IsNotEmpty,
  IsBoolean,
} from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsMongoId()
  parentId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
