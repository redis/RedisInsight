import { ApiProperty } from '@nestjs/swagger';
import { KeyResponse } from 'src/modules/browser/keys/dto';
import { RedisStringType } from 'src/common/decorators';
import { REDIS_STRING_SCHEMA } from 'src/common/decorators/redis-string-schema.decorator';
import { RedisString } from 'src/common/constants';

export class GetArrayElementResponse extends KeyResponse {
  @ApiProperty({
    description:
      'Value stored at the requested index, or null if the slot is empty.',
    ...REDIS_STRING_SCHEMA,
    nullable: true,
  })
  @RedisStringType()
  value: RedisString | null;
}
