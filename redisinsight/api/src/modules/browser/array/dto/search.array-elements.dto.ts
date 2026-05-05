import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  Min,
  Validate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RedisString } from 'src/common/constants';
import { IsRedisString, RedisStringType } from 'src/common/decorators';
import { KeyDto } from 'src/modules/browser/keys/dto';
import { IsArrayBoundConstraint } from './array-index.validation';

export enum ArraySearchPredicate {
  Exact = 'EXACT',
  Match = 'MATCH',
  Glob = 'GLOB',
  Re = 'RE',
}

export class SearchArrayElementsDto extends KeyDto {
  @ApiPropertyOptional({
    description: 'Inclusive search start bound. Use "-" for the minimum.',
    type: String,
    default: '-',
  })
  @IsOptional()
  @Validate(IsArrayBoundConstraint)
  start?: string = '-';

  @ApiPropertyOptional({
    description: 'Inclusive search end bound. Use "+" for the maximum.',
    type: String,
    default: '+',
  })
  @IsOptional()
  @Validate(IsArrayBoundConstraint)
  end?: string = '+';

  @ApiPropertyOptional({
    enum: ArraySearchPredicate,
    default: ArraySearchPredicate.Match,
  })
  @IsOptional()
  @IsEnum(ArraySearchPredicate)
  predicate?: ArraySearchPredicate = ArraySearchPredicate.Match;

  @ApiProperty({
    description: 'Text predicate value.',
    type: String,
  })
  @IsRedisString()
  @RedisStringType()
  query: RedisString;

  @ApiPropertyOptional({
    description: 'Use case-insensitive matching.',
    type: Boolean,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  noCase?: boolean = false;

  @ApiProperty({
    description: 'Maximum number of matching elements to return.',
    type: Number,
    minimum: 1,
    default: 15,
  })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  count: number;
}
