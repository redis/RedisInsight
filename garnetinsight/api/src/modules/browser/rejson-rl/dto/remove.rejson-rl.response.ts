import { ApiProperty } from '@nestjs/swagger';

export class RemoveRejsonRlResponse {
  @ApiProperty({
    description: 'Integer , specifically the number of paths deleted (0 or 1).',
    type: Number,
  })
  affected: number;
}
