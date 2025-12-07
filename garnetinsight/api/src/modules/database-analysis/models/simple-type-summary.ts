import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SimpleTypeSummary {
  @ApiProperty({
    description: 'Type name',
    type: String,
    example: 'string',
  })
  @Expose()
  type: string;

  @ApiProperty({
    description: 'Total inside this type of data',
    type: Number,
    example: 10000,
  })
  @Expose()
  total: number;
}
