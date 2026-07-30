import { PartialType } from '@nestjs/swagger';
import { CreateBulkOrderDto } from './create-bulk-order.dto';

export class UpdateBulkOrderDto extends PartialType(CreateBulkOrderDto) {}
