import { ApiProperty } from '@nestjs/swagger';
import { MAX_TTL_NUMBER } from 'src/constants';

export class KeyTtlResponse {
  @ApiProperty({
    type: Number,
    description:
      'The remaining time to live of a key that has a timeout. ' +
      'If value equals -2 then the key does not exist or has deleted. ' +
      'If value equals -1 then the key has no associated expire (No limit).',
    maximum: MAX_TTL_NUMBER,
  })
  ttl: number;
}
