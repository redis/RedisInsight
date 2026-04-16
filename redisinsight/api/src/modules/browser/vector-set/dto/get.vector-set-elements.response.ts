import { KeyResponse } from 'src/modules/browser/keys/dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VectorSetElementKeyDto } from './vector-set-element-key.dto';

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
    description: 'Array of vector set elements.',
    isArray: true,
    type: () => VectorSetElementKeyDto,
  })
  elements: VectorSetElementKeyDto[];
}
