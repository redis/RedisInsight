import { KeyResponse } from 'src/modules/browser/keys/dto';
import { ApiProperty } from '@nestjs/swagger';
import { RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';

export class GetStringValueResponse extends KeyResponse {
  @ApiProperty({
    description: 'Key value',
    type: String,
  })
  @RedisStringType()
  value: RedisString;
}
