import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SumGroup {
  @ApiProperty({
    description: 'Group Label',
    type: String,
    example: '1-4 Hrs',
  })
  @Expose()
  label: string;

  @ApiProperty({
    description: 'Sum of data (e.g. memory, or number of keys)',
    type: Number,
    example: 10000,
  })
  @Expose()
  total: number;

  @ApiProperty({
    description:
      'Group threshold during analyzing (all values less then (<) threshold)',
    type: Number,
    example: -1,
  })
  @Expose()
  threshold: number;
}
