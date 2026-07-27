import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetSettingDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  value: string;
}
