import { ApiProperty } from '@nestjs/swagger';
import { ApiRedisString, RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';

export class SetListElementResponse {
  @ApiProperty({
    description: 'Element index',
    type: Number,
    minimum: 0,
  })
  index: number;

  @ApiRedisString('List element')
  @RedisStringType()
  element: RedisString;
}
