import { ApiProperty } from '@nestjs/swagger';

export class DeleteStreamEntriesResponse {
  @ApiProperty({
    description: 'Number of deleted entries',
    type: Number,
  })
  affected: number;
}
