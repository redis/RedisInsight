import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { KeyResponse } from 'src/modules/browser/keys/dto';
import { RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';

export class ArrayElementDto {
  @ApiProperty({
    description: 'Zero-based index of the element.',
    type: Number,
  })
  index: number;

  @ApiProperty({
    description: 'Value stored at this index.',
    type: String,
  })
  @RedisStringType()
  value: RedisString;
}

export class GetArrayElementsResponse extends KeyResponse {
  @ApiProperty({
    type: Number,
    description: 'Number of non-empty elements in the array (ARCOUNT).',
  })
  total: number;

  @ApiProperty({
    type: Number,
    description: 'Logical length of the array: highest set index + 1 (ARLEN).',
  })
  logicalLength: number;

  @ApiPropertyOptional({
    type: Number,
    description:
      'Cursor for the next page. Pass as `cursor` in the next request. ' +
      'Null when there are no more elements to fetch.',
  })
  nextCursor?: number;

  @ApiProperty({
    description: 'Array elements returned from ARSCAN.',
    isArray: true,
    type: ArrayElementDto,
  })
  elements: ArrayElementDto[];
}
