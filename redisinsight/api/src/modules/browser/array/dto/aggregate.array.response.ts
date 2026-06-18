import { ApiProperty } from '@nestjs/swagger';
import { KeyResponse } from 'src/modules/browser/keys/dto';

export class AggregateArrayResponse extends KeyResponse {
  @ApiProperty({
    description:
      'Aggregation result. Numeric ops (SUM/MIN/MAX/AND/OR/XOR) return a ' +
      'decimal string; MATCH/USED return an integer count as a string. ' +
      'Always serialized as a string to preserve full u64 / large-number ' +
      'precision. Returns `null` when AROP yields a nil reply (numeric ops ' +
      'over a range with no numeric values; bitwise ops over an empty range).',
    type: String,
    nullable: true,
    example: '104.7',
  })
  result: string | null;
}
