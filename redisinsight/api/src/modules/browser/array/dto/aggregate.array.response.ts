import { ApiProperty } from '@nestjs/swagger';
import { KeyResponse } from 'src/modules/browser/keys/dto';

export class AggregateArrayResponse extends KeyResponse {
  @ApiProperty({
    description:
      'Aggregation result. Numeric ops (SUM/MIN/MAX/AND/OR/XOR) return a ' +
      'decimal string; MATCH/USED return an integer count as a string. ' +
      'Returns `null` when AROP yields a nil reply (numeric ops over a ' +
      'range with no numeric values; bitwise ops over an empty range). ' +
      'Precision: SUM/MIN/MAX preserve full precision (Redis returns a ' +
      'bulk string); MATCH/USED are bounded by the 1,000,000-element span ' +
      'cap and always fit safely. AND/OR/XOR return RESP integers and are ' +
      'parsed by the Node Redis client as JavaScript numbers, so results ' +
      'above Number.MAX_SAFE_INTEGER (2^53 - 1) may be rounded — use the ' +
      'raw AROP command via Workbench when full u64 precision is required.',
    type: String,
    nullable: true,
    example: '104.7',
  })
  result: string | null;
}
