import { ApiProperty } from '@nestjs/swagger';

export class DeleteArrayResponse {
  @ApiProperty({
    description:
      'Count of elements actually deleted. Unsigned 64-bit integer as string. ' +
      'Indexes pointing at an empty slot contribute 0.',
    type: String,
    example: '2',
  })
  affected: string;
}
