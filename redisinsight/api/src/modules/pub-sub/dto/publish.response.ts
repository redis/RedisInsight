import { ApiProperty } from '@nestjs/swagger';

export class PublishResponse {
  @ApiProperty({
    description: 'Number of clients message ws delivered',
    type: Number,
  })
  affected: number;
}
