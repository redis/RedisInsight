import { BulkActionFilter } from 'src/modules/bulk-actions/models/bulk-action-filter';
import { BulkActionType } from 'src/modules/bulk-actions/constants';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BulkActionIdDto } from 'src/modules/bulk-actions/dto/bulk-action-id.dto';

export class CreateBulkActionDto extends BulkActionIdDto {
  @IsNotEmpty()
  @IsString()
  databaseId: string;

  @IsNotEmpty()
  @IsEnum(BulkActionType, {
    message: `type must be a valid enum value. Valid values: ${Object.values(
      BulkActionType,
    )}.`,
  })
  type: BulkActionType;

  @IsNotEmpty()
  @Type(() => BulkActionFilter)
  filter: BulkActionFilter;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(2147483647)
  db?: number;

  @IsOptional()
  @IsBoolean()
  enableReporting?: boolean;
}
