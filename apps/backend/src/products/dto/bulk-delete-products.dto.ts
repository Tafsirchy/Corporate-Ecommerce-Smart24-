import { IsArray, ArrayNotEmpty, IsMongoId } from 'class-validator';

export class BulkDeleteProductsDto {
  @IsArray()
  @ArrayNotEmpty({ message: 'Please select at least one product to delete' })
  @IsMongoId({ each: true, message: 'Each product ID must be a valid ID' })
  ids: string[];
}

