import { ApiProperty } from '@nestjs/swagger';

export class DeleteVectorSetElementsResponse {
  @ApiProperty({
    description: 'Number of elements that were removed',
    type: Number,
  })
  affected: number;
}
