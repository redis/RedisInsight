import { ApiProperty } from '@nestjs/swagger';

export class DeleteConsumerGroupsResponse {
  @ApiProperty({
    description: 'Number of deleted consumer groups',
    type: Number,
  })
  affected: number;
}
