import { KeyResponse } from 'src/modules/browser/keys/dto';
import { ApiProperty } from '@nestjs/swagger';
import { ZSetMemberDto } from './z-set-member.dto';

export class GetZSetResponse extends KeyResponse {
  @ApiProperty({
    type: Number,
    description: 'The number of members in the currently-selected z-set.',
  })
  total: number;

  @ApiProperty({
    description: 'Array of Members.',
    isArray: true,
    type: () => ZSetMemberDto,
  })
  members: ZSetMemberDto[];
}
