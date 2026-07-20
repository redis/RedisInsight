import { ApiProperty } from '@nestjs/swagger';
import { KeyResponse } from 'src/modules/browser/keys/dto';
import { RedisStringType } from 'src/common/decorators';
import { REDIS_STRING_SCHEMA } from 'src/common/decorators/redis-string-schema.decorator';
import { RedisString } from 'src/common/constants';

export class GetArrayRangeResponse extends KeyResponse {
  @ApiProperty({
    description:
      'Values for each index in the requested range, in order. ' +
      'Empty slots are returned as null.',
    type: 'array',
    // Each item mirrors the project-wide RedisString schema (string | Buffer
    // object under ?encoding=buffer); `nullable: true` on the item is the
    // OAS 3.0 way to express `(string | null)[]`.
    items: { oneOf: REDIS_STRING_SCHEMA.oneOf, nullable: true },
  })
  @RedisStringType({ each: true })
  elements: (RedisString | null)[];
}
