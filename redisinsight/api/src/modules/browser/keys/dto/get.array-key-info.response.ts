import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RedisStringType, ApiRedisString } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';

/**
 * Key-info response for the Array data type.
 *
 * `length` (ARLEN) and `count` (ARCOUNT) are returned as decimal strings
 * because an Array's index space is unsigned 64-bit and can exceed
 * Number.MAX_SAFE_INTEGER for sparse keys. Consumers must narrow on the
 * `array` key type before reading these fields and avoid silent numeric
 * coercion that would round large values.
 */
export class GetArrayKeyInfoResponse {
  @ApiRedisString()
  @RedisStringType()
  name: RedisString;

  @ApiPropertyOptional({
    type: String,
    description: 'Always "array" for this response shape.',
  })
  type?: string;

  @ApiPropertyOptional({
    type: Number,
    description:
      'The remaining time to live of a key.' +
      ' If the property has value of -1, then the key has no expiration time (no limit).',
  })
  ttl?: number;

  @ApiPropertyOptional({
    type: Number,
    description:
      'The number of bytes that the array key and its value require to be stored in RAM.',
  })
  size?: number;

  @ApiProperty({
    type: String,
    description:
      'Logical length of the array (highest set index + 1, includes gaps).' +
      ' Unsigned 64-bit integer as a decimal string.',
    example: '7',
  })
  length: string;

  @ApiProperty({
    type: String,
    description:
      'Populated element count (excludes empty slots, ARCOUNT).' +
      ' Unsigned 64-bit integer as a decimal string.',
    example: '5',
  })
  count: string;
}
