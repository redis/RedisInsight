import { ApiProperty } from '@nestjs/swagger';

export class DeleteVectorSetElementsResponse {
  @ApiProperty({
    description: 'Total count of the vector set elements removed.',
    type: Number,
  })
  affected: number;
}
