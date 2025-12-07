import { KeyDto } from 'src/modules/browser/keys/dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsString, Min } from 'class-validator';
import { SortOrder } from 'src/constants';

export class GetStreamEntriesDto extends KeyDto {
  @ApiPropertyOptional({
    description: 'Specifying the start id',
    type: String,
    default: '-',
  })
  @IsString()
  start?: string = '-';

  @ApiPropertyOptional({
    description: 'Specifying the end id',
    type: String,
    default: '+',
  })
  @IsString()
  end?: string = '+';

  @ApiPropertyOptional({
    description: 'Specifying the number of entries to return.',
    type: Number,
    minimum: 1,
    default: 500,
  })
  @IsInt()
  @Min(1)
  count?: number = 500;

  @ApiProperty({
    description: 'Get entries sort by IDs order.',
    default: SortOrder.Desc,
    enum: SortOrder,
  })
  @IsEnum(SortOrder, {
    message: `sortOrder must be a valid enum value. Valid values: ${Object.values(
      SortOrder,
    )}.`,
  })
  sortOrder?: SortOrder = SortOrder.Desc;
}
