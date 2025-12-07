import { ApiProperty } from '@nestjs/swagger';

export class DeleteDatabasesResponse {
  @ApiProperty({
    description: 'Number of affected database instances',
    type: Number,
  })
  affected: number;
}
