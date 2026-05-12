import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';

export class SearchVectorSetMatchDto {
  @ApiProperty({
    type: String,
    description: 'Matched element name.',
  })
  @RedisStringType()
  name: RedisString;

  @ApiProperty({
    type: Number,
    description:
      'Similarity score between the query vector and the matched element. ' +
      'Returned by VSIM ... WITHSCORES.',
  })
  score: number;

  @ApiPropertyOptional({
    type: String,
    description:
      'Attributes string stored on the matched element (typically JSON). ' +
      'Omitted when the element has no attributes.',
  })
  attributes?: string;
}
