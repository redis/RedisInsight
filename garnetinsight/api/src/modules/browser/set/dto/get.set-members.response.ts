import { ApiProperty } from '@nestjs/swagger';
import { KeyResponse } from 'src/modules/browser/keys/dto';
import { RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';

export class SetScanResponse extends KeyResponse {
  @ApiProperty({
    type: Number,
    minimum: 0,
    description:
      'The new cursor to use in the next call.' +
      ' If the property has value of 0, then the iteration is completed.',
  })
  nextCursor: number;

  @ApiProperty({
    type: () => String,
    description: 'Array of members.',
    isArray: true,
  })
  @RedisStringType({ each: true })
  members: RedisString[];
}

export class GetSetMembersResponse extends SetScanResponse {
  @ApiProperty({
    type: Number,
    description: 'The number of members in the currently-selected set.',
  })
  total: number;
}
