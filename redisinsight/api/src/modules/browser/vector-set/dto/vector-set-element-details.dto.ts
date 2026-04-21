import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDefined } from 'class-validator';
import { IsRedisString, RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';

export const VECTOR_EMBEDDING_MAX_DISPLAY_LENGTH = 100_000;

export class VectorSetElementDetailsDto {
  @ApiProperty({
    type: String,
    description: 'Element name value.',
  })
  @IsDefined()
  @IsRedisString()
  @RedisStringType()
  name: RedisString;

  @ApiPropertyOptional({
    description: `Vector embedding values. Truncated to the first ${VECTOR_EMBEDDING_MAX_DISPLAY_LENGTH} items when the full dimension exceeds the limit.`,
    type: [Number],
    isArray: true,
  })
  vector?: number[];

  @ApiPropertyOptional({
    description: `True when the vector was truncated because its dimension exceeds ${VECTOR_EMBEDDING_MAX_DISPLAY_LENGTH}.`,
    type: Boolean,
  })
  vectorTruncated?: boolean;

  @ApiPropertyOptional({
    description: 'JSON attributes associated with the element.',
    type: String,
  })
  attributes?: string;
}
