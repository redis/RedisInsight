import { KeyResponse } from 'src/modules/browser/keys/dto';
import { ApiProperty } from '@nestjs/swagger';
import { RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';

export class GetListElementsResponse extends KeyResponse {
  @ApiProperty({
    type: Number,
    description: 'The number of elements in the currently-selected list.',
  })
  total: number;

  @ApiProperty({
    type: () => String,
    description: 'Array of elements.',
    isArray: true,
  })
  @RedisStringType({ each: true })
  elements: RedisString[];
}
