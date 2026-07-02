import { ApiProperty } from '@nestjs/swagger';
import { KeyResponse } from 'src/modules/browser/keys/dto';

export class AggregateArrayResponse extends KeyResponse {
  @ApiProperty({
    description:
      'Aggregation result. Numeric ops (SUM/MIN/MAX/AND/OR/XOR) return a ' +
      'decimal string; MATCH/USED return an integer count as a string. ' +
      'Returns `null` when AROP yields a nil reply (numeric ops over a ' +
      'range with no numeric values; bitwise ops over an empty range). ' +
      'Full u64 precision is preserved: SUM/MIN/MAX arrive as bulk strings, ' +
      'and AND/OR/XOR/MATCH/USED integer replies are read with the bigint ' +
      'opt-in, so results above Number.MAX_SAFE_INTEGER (2^53 - 1) stay exact.',
    type: String,
    nullable: true,
    example: '104.7',
  })
  result: string | null;
}
