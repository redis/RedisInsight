import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class NspTypeSummary {
  @ApiProperty({
    description: 'Type name',
    type: String,
    example: 'hash',
  })
  @Expose()
  type: string;

  @ApiProperty({
    description: 'Total memory in bytes inside particular data type',
    type: Number,
    example: 10_000,
  })
  @Expose()
  memory: number;

  @ApiProperty({
    description: 'Total keys inside particular data type',
    type: Number,
    example: 10_000,
  })
  @Expose()
  keys: number;
}
