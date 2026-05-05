import { ApiProperty } from '@nestjs/swagger';
import { RedisString } from 'src/common/constants';
import { RedisStringType } from 'src/common/decorators';
import { KeyResponse } from 'src/modules/browser/keys/dto';

export class GetArrayElementResponse extends KeyResponse {
  @ApiProperty({
    type: String,
    description: 'Array element index.',
  })
  index: string;

  @ApiProperty({
    type: String,
    description: 'Array element value.',
  })
  @RedisStringType()
  value: RedisString;
}
