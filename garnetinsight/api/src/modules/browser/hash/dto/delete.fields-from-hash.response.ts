import { ApiProperty } from '@nestjs/swagger';

export class DeleteFieldsFromHashResponse {
  @ApiProperty({
    description: 'Number of affected fields',
    type: Number,
  })
  affected: number;
}
