import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDefined,
  IsEnum,
  IsInt,
  IsOptional,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { KeyDto } from 'src/modules/browser/keys/dto';
import {
  ApiRedisString,
  IsArrayIndex,
  IsRedisString,
  RedisStringType,
} from 'src/common/decorators';
import { RedisString } from 'src/common/constants';
import { ARRAY_RANGE_MAX_ELEMENTS } from 'src/modules/browser/array/constants';

export enum ArrayGrepCriteria {
  Exact = 'EXACT',
  Match = 'MATCH',
  Glob = 'GLOB',
  Re = 'RE',
}

export enum ArrayCombinator {
  And = 'AND',
  Or = 'OR',
}

export class ArrayGrepPredicate {
  @ApiProperty({ description: 'Match criteria.', enum: ArrayGrepCriteria })
  @IsEnum(ArrayGrepCriteria)
  criteria: ArrayGrepCriteria;

  @ApiRedisString('Pattern / value to match.')
  @IsDefined()
  @IsRedisString()
  @RedisStringType()
  value: RedisString;
}

export class GetArraySearchDto extends KeyDto {
  @ApiProperty({
    description: 'Predicates to match. Combined by a single global connective.',
    type: ArrayGrepPredicate,
    isArray: true,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ArrayGrepPredicate)
  predicates: ArrayGrepPredicate[];

  @ApiPropertyOptional({
    description:
      'Single global connective applied across all predicates. When omitted, ' +
      'the server default (OR) applies. Ignored with a single predicate.',
    enum: ArrayCombinator,
  })
  @IsOptional()
  @IsEnum(ArrayCombinator)
  combinator?: ArrayCombinator;

  @ApiPropertyOptional({
    description:
      'Start index (inclusive), u64 as string. Omitted ⇒ first index (ARGREP `-`).',
    type: String,
    example: '0',
  })
  @IsOptional()
  @IsArrayIndex()
  start?: string;

  @ApiPropertyOptional({
    description:
      'End index (inclusive), u64 as string. Omitted ⇒ last index (ARGREP `+`).',
    type: String,
    example: '99',
  })
  @IsOptional()
  @IsArrayIndex()
  end?: string;

  @ApiPropertyOptional({
    description: 'Case-insensitive matching (ARGREP NOCASE).',
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  nocase?: boolean;

  @ApiPropertyOptional({
    description:
      'Return [index, value] pairs (ARGREP WITHVALUES). Default true.',
    type: Boolean,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  withValues?: boolean;

  @ApiPropertyOptional({
    description:
      'Maximum matches to return (1..' +
      `${ARRAY_RANGE_MAX_ELEMENTS.toLocaleString('en-US')}). ` +
      'Maps to the ARGREP LIMIT option.',
    type: Number,
    minimum: 1,
    maximum: ARRAY_RANGE_MAX_ELEMENTS,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(ARRAY_RANGE_MAX_ELEMENTS)
  @Type(() => Number)
  limit?: number;
}
