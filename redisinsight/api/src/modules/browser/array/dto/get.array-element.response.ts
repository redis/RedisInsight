import { ApiProperty } from '@nestjs/swagger';
import { KeyResponse } from 'src/modules/browser/keys/dto';
import { RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';

export class GetArrayElementResponse extends KeyResponse {
  @ApiProperty({
    description:
      'Value stored at the requested index, or null if the slot is empty.',
    type: String,
    nullable: true,
  })
  @RedisStringType()
  value: RedisString | null;
}
