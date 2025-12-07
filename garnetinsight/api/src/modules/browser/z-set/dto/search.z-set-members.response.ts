import { ApiProperty } from '@nestjs/swagger';
import { ScanZSetResponse } from './search.z-set.response';

export class SearchZSetMembersResponse extends ScanZSetResponse {
  @ApiProperty({
    type: Number,
    description: 'The number of members in the currently-selected z-set.',
  })
  total: number;
}
