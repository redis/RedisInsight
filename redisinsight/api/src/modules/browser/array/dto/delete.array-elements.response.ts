import { ApiProperty } from '@nestjs/swagger';

export class DeleteArrayElementsResponse {
  @ApiProperty({
    description: 'Total count of array elements removed.',
    type: Number,
  })
  affected: number;
}
