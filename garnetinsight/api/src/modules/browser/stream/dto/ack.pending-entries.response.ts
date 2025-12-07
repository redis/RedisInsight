import { ApiProperty } from '@nestjs/swagger';

export class AckPendingEntriesResponse {
  @ApiProperty({
    description: 'Number of affected entries',
    type: Number,
  })
  affected: number;
}
