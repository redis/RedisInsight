import { ApiProperty } from '@nestjs/swagger';

export class DeleteBrowserHistoryItemsResponse {
  @ApiProperty({
    description: 'Number of affected browser history items',
    type: Number,
  })
  affected: number;
}
