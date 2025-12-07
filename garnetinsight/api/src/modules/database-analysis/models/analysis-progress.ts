import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class AnalysisProgress {
  @ApiProperty({
    description: 'Total keys in the database',
    type: Number,
    example: 10_000_000,
  })
  @Expose()
  total: number = 0;

  @ApiProperty({
    description: 'Total keys scanned for entire database',
    type: Number,
    example: 30_000,
  })
  @Expose()
  scanned: number = 0;

  @ApiProperty({
    description:
      'Total keys processed for entire database. (Filtered keys returned by scan command)',
    type: Number,
    example: 5_000,
  })
  @Expose()
  processed: number = 0;
}
