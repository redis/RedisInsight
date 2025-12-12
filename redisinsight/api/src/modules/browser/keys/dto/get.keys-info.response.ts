import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';

export interface VectorSetInfo {
  'quant-type'?: string;
  'vector-dim'?: number;
  size?: number;
  'max-level'?: number;
  'vset-uid'?: number;
  'hnsw-max-node-uid'?: number;
}

export class GetKeyInfoResponse {
  @ApiProperty({
    type: String,
  })
  @RedisStringType()
  name: RedisString;

  @ApiProperty({
    type: String,
  })
  type?: string;

  @ApiProperty({
    type: Number,
    description:
      'The remaining time to live of a key.' +
      ' If the property has value of -1, then the key has no expiration time (no limit).',
  })
  ttl?: number;

  @ApiProperty({
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
    description:
      'Vector set info from VINFO command (for vector set keys only).',
  })
  vinfo?: VectorSetInfo;
}
