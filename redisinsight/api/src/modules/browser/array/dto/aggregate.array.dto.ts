import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, ValidateIf } from 'class-validator';
import { KeyDto } from 'src/modules/browser/keys/dto';
import {
  ApiRedisString,
  IsArrayIndex,
  IsRedisString,
  RedisStringType,
} from 'src/common/decorators';
import { RedisString } from 'src/common/constants';

export enum ArrayAggregateOperation {
  Sum = 'SUM',
  Min = 'MIN',
  Max = 'MAX',
  And = 'AND',
  Or = 'OR',
  Xor = 'XOR',
  Match = 'MATCH',
  Used = 'USED',
}

export class AggregateArrayDto extends KeyDto {
  @ApiProperty({
    description:
      'Start index of the range (inclusive). Unsigned 64-bit integer as string.',
    type: String,
    example: '0',
  })
  @IsArrayIndex()
  start: string;

  @ApiProperty({
    description:
      'End index of the range (inclusive). Unsigned 64-bit integer as string. ' +
      'AROP semantics ignore range direction — the same set of populated slots ' +
      'is aggregated regardless of start/end ordering.',
    type: String,
    example: '99',
  })
  @IsArrayIndex()
  end: string;

  @ApiProperty({
    description:
      'Aggregation operation. Numeric ops (SUM/MIN/MAX/AND/OR/XOR) error ' +
      'server-side if any element in range is non-numeric. MATCH counts ' +
      'elements equal to `value`. USED counts populated slots.',
    enum: ArrayAggregateOperation,
    example: ArrayAggregateOperation.Sum,
  })
  @IsEnum(ArrayAggregateOperation)
  operation: ArrayAggregateOperation;

  @ApiRedisString(
    'Comparison value for the MATCH operation. Required when operation is ' +
      'MATCH, ignored otherwise. Accepts strings and binary buffers so it can ' +
      'match elements stored as raw bytes.',
    false,
    false,
  )
  @ValidateIf(
    (o: AggregateArrayDto) => o.operation === ArrayAggregateOperation.Match,
  )
  @IsRedisString()
  @RedisStringType()
  value?: RedisString;
}
