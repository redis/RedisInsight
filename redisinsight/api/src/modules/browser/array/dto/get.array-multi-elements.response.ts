import { ApiProperty } from '@nestjs/swagger';
import { KeyResponse } from 'src/modules/browser/keys/dto';
import { RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';

export class GetArrayMultiElementsResponse extends KeyResponse {
  @ApiProperty({
    description:
      'Values for each requested index, in request order. ' +
      'Empty slots are returned as null.',
    type: 'array',
    items: { oneOf: [{ type: 'string' }, { type: 'null' }] },
    nullable: true,
  })
  @RedisStringType({ each: true })
  elements: (RedisString | null)[];
}
