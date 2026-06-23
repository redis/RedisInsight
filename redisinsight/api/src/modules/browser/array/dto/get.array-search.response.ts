import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { KeyResponse } from 'src/modules/browser/keys/dto';
import { RedisStringType } from 'src/common/decorators';
import { REDIS_STRING_SCHEMA } from 'src/common/decorators/redis-string-schema.decorator';
import { RedisString } from 'src/common/constants';

export class ArraySearchElement {
  @ApiProperty({
    description:
      'Index of the matched element. Unsigned 64-bit integer as string.',
    type: String,
  })
  index: string;

  @ApiProperty({
    description:
      'Value at this index, or null when WITHVALUES is not requested.',
    oneOf: REDIS_STRING_SCHEMA.oneOf,
    nullable: true,
  })
  @RedisStringType()
  value: RedisString | null;
}

export class GetArraySearchResponse extends KeyResponse {
  @ApiProperty({
    description: 'Matched elements, in ARGREP result order.',
    type: () => ArraySearchElement,
    isArray: true,
  })
  @Type(() => ArraySearchElement)
  elements: ArraySearchElement[];
}
