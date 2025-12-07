import { ApiProperty } from '@nestjs/swagger';

export class DeleteMembersFromSetResponse {
  @ApiProperty({
    description: 'Number of affected members',
    type: Number,
  })
  affected: number;
}
