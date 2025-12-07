import { KeyDto } from 'src/modules/browser/keys/dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { SortOrder } from 'src/constants';

export class GetZSetMembersDto extends KeyDto {
  @ApiProperty({
    description: 'Specifying the number of elements to skip.',
    type: Number,
    minimum: 0,
    default: '0',
  })
  @IsInt()
  @Min(0)
  @Type(() => Number)
  @IsNotEmpty()
  offset: number;

  @ApiProperty({
    description:
      'Specifying the number of elements to return from starting at offset.',
    type: Number,
    minimum: 1,
    default: 15,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsNotEmpty()
  count: number;

  @ApiProperty({
    description:
      'Get elements sorted by score.' +
      ' In order to sort the members from the highest to the lowest score, use the DESC value, else ASC value',
    default: SortOrder.Desc,
    enum: SortOrder,
  })
  @IsNotEmpty()
  @IsEnum(SortOrder, {
    message: `sortOrder must be a valid enum value. Valid values: ${Object.values(
      SortOrder,
    )}.`,
  })
  sortOrder: SortOrder;
}
