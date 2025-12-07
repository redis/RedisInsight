import { KeyResponse } from 'src/modules/browser/keys/dto';
import { ApiProperty } from '@nestjs/swagger';
import { ZSetMemberDto } from './z-set-member.dto';

export class ScanZSetResponse extends KeyResponse {
  @ApiProperty({
    type: Number,
    minimum: 0,
    description:
      'The new cursor to use in the next call.' +
      ' If the property has value of 0, then the iteration is completed.',
  })
  nextCursor: number;

  @ApiProperty({
    description: 'Array of Members.',
    isArray: true,
    type: () => ZSetMemberDto,
  })
  members: ZSetMemberDto[];
}
