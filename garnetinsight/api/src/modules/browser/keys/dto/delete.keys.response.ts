import { ApiProperty } from '@nestjs/swagger';

export class DeleteKeysResponse {
  @ApiProperty({
    description: 'Number of affected keys',
    type: Number,
  })
  affected: number;
}
