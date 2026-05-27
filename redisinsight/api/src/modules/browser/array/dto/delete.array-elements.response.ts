import { ApiProperty } from '@nestjs/swagger';

export class DeleteArrayElementsResponse {
  @ApiProperty({
    description: 'Total number of array elements removed.',
    type: Number,
  })
  affected: number;
}
