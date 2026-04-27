import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsBase64,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsRedisString, RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';
import { KeyDto } from 'src/modules/browser/keys/dto';

export const VSIM_DEFAULT_COUNT = 10;
export const VSIM_MAX_COUNT = 1000;
export const VSIM_FILTER_MAX_LENGTH = 2048;

/**
 * Request DTO for the VSIM similarity search endpoint. Exactly one of
 * `elementName`, `vectorValues`, or `vectorFp32` must be supplied.
 */
export class SearchVectorSetDto extends KeyDto {
  @ApiPropertyOptional({
    type: String,
    description:
      'Run similarity search using an existing element name as the query ' +
      'vector. Mutually exclusive with `vectorValues` and `vectorFp32`; ' +
      'exactly one of the three must be supplied.',
  })
  @ValidateIf((o) => o.vectorValues === undefined && o.vectorFp32 === undefined)
  @IsRedisString()
  @RedisStringType()
  elementName?: RedisString;

  @ApiPropertyOptional({
    description:
      'Query vector embedding as numeric values. Mutually exclusive with ' +
      '`elementName` and `vectorFp32`; exactly one of the three must be supplied.',
    type: [Number],
    isArray: true,
  })
  @ValidateIf((o) => o.elementName === undefined && o.vectorFp32 === undefined)
  @IsArray()
  @ArrayNotEmpty()
  vectorValues?: number[];

  @ApiPropertyOptional({
    type: String,
    description:
      'Query vector embedding as a base64-encoded little-endian IEEE-754 ' +
      'FP32 blob. Decoded length must be a non-zero multiple of 4 bytes. ' +
      'Mutually exclusive with `elementName` and `vectorValues`.',
  })
  @ValidateIf(
    (o) => o.elementName === undefined && o.vectorValues === undefined,
  )
  @IsString()
  @IsBase64()
  vectorFp32?: string;

  @ApiPropertyOptional({
    description: 'Maximum number of similar elements to return.',
    type: Number,
    minimum: 1,
    maximum: VSIM_MAX_COUNT,
    default: VSIM_DEFAULT_COUNT,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(VSIM_MAX_COUNT)
  @Type(() => Number)
  count?: number = VSIM_DEFAULT_COUNT;

  @ApiPropertyOptional({
    description:
      'Optional filter expression evaluated against element attributes. ' +
      'Passed verbatim to Redis after the `FILTER` token.',
    type: String,
    maxLength: VSIM_FILTER_MAX_LENGTH,
  })
  @IsOptional()
  @IsString()
  @MaxLength(VSIM_FILTER_MAX_LENGTH)
  filter?: string;
}
