import {
  IsString,
  IsUrl,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';

export class UpsertBusinessCollectionDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  subtitle: string;

  @IsString()
  @IsNotEmpty()
  buttonText: string;

  @IsUrl()
  @IsNotEmpty()
  imageUrl: string;

  @IsString()
  @IsNotEmpty()
  targetUrl: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
