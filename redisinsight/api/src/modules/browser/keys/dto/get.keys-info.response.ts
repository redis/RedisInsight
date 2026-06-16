import { ApiPropertyOptional } from '@nestjs/swagger';
import { RedisStringType, ApiRedisString } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';

export class GetKeyInfoResponse {
  @ApiRedisString()
  @RedisStringType()
  name: RedisString;

  @ApiPropertyOptional({
    type: String,
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
      'The number of bytes that a key and its value require to be stored in RAM.',
  })
  size?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'The length of the value stored in a key.',
  })
  length?: number;

  @ApiPropertyOptional({
    type: String,
    description:
      'The quantization type used for vector set keys (e.g., int8, float32).',
  })
  quantType?: string;

  @ApiPropertyOptional({
    type: Number,
    description: 'The vector dimensions for vector set keys.',
  })
  vectorDim?: number;
}
