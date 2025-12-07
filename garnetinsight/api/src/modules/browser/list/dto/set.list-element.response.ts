import { ApiProperty } from '@nestjs/swagger';
import { RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';

export class SetListElementResponse {
  @ApiProperty({
    description: 'Element index',
    type: Number,
    minimum: 0,
  })
  index: number;

  @ApiProperty({
    description: 'List element',
    type: String,
  })
  @RedisStringType()
  element: RedisString;
}
