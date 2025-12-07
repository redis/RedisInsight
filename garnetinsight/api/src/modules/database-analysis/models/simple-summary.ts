import { SimpleTypeSummary } from 'src/modules/database-analysis/models/simple-type-summary';
import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SimpleSummary {
  @ApiProperty({
    description: 'Total number',
    type: Number,
    example: 10000,
  })
  @Expose()
  total: number;

  @ApiProperty({
    description: 'Array with totals by type',
    isArray: true,
    type: () => SimpleTypeSummary,
  })
  @Expose()
  types: SimpleTypeSummary[];
}
