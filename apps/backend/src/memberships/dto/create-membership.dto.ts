import { IsString, IsNumber, IsOptional, IsArray, Min } from 'class-validator';

export class CreateMembershipDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  requiredAmount: number;

  @IsNumber()
  @Min(1)
  pointMultiplier: number;

  @IsNumber()
  @Min(1)
  priority: number;

  @IsArray()
  @IsString({ each: true })
  benefits: string[];

  @IsString()
  @IsOptional()
  badgeUrl?: string;
}
