import { PartialType } from '@nestjs/swagger';
import { CreateSavedListDto } from './create-saved-list.dto';

export class UpdateSavedListDto extends PartialType(CreateSavedListDto) {}
