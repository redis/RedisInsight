import { KeyResponse } from 'src/modules/browser/keys/dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';

export class GetVectorSetElementsResponse extends KeyResponse {
  @ApiProperty({
    type: Number,
    description: 'The number of elements in the currently-selected vector set.',
  })
  total: number;

  @ApiPropertyOptional({
    type: String,
    description:
      'The cursor to use for the next page. ' +
      'If null, there are no more elements to fetch.',
  })
  nextCursor?: string;

  @ApiProperty({
    type: Boolean,
    description:
      'True when the server supports ordered cursor pagination for listing elements. ' +
      'False when only random sampling is available for this Redis version.',
  })
  isPaginationSupported: boolean;

  @ApiProperty({
    description: 'Array of vector set element names.',
    isArray: true,
    type: String,
  })
  @RedisStringType({ each: true })
  elementNames: RedisString[];
}
