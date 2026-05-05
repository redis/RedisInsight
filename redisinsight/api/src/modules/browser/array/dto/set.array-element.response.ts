import { ApiProperty } from '@nestjs/swagger';
import { RedisString } from 'src/common/constants';
import { RedisStringType } from 'src/common/decorators';

export class SetArrayElementResponse {
  @ApiProperty({
    description: 'Array element index.',
    type: String,
  })
  index: string;

  @ApiProperty({
    description: 'Array element value.',
    type: String,
  })
  @RedisStringType()
  value: RedisString;
}
