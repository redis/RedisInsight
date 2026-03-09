import { KeyResponse } from 'src/modules/browser/keys/dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VectorSetElementDto } from './vector-set-element.dto';

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
    description: 'Array of vector set elements.',
    isArray: true,
    type: () => VectorSetElementDto,
  })
  elements: VectorSetElementDto[];
}
