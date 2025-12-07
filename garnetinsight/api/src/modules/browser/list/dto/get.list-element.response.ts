import { KeyResponse } from 'src/modules/browser/keys/dto';
import { ApiProperty } from '@nestjs/swagger';
import { RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';

export class GetListElementResponse extends KeyResponse {
  @ApiProperty({
    type: () => String,
    description: 'Element value',
  })
  @RedisStringType()
  value: RedisString;
}
