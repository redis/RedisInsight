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
    // OAS 3.0: `type: 'null'` is not a valid schema type and `nullable: true`
    // on the array would mark the array itself as nullable. Putting
    // `nullable: true` on the item schema is the OAS 3.0 way to express
    // `(string | null)[]` so the generated client types items correctly.
    items: { type: 'string', nullable: true },
  })
  @RedisStringType({ each: true })
  elements: (RedisString | null)[];
}
