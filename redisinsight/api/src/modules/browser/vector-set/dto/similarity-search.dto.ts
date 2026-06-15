import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBase64,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsRedisString, RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';
import { KeyDto } from 'src/modules/browser/keys/dto';

export const VSIM_DEFAULT_COUNT = 10;
export const VSIM_MAX_COUNT = 1000;
export const VSIM_FILTER_MAX_LENGTH = 2048;

/**
 * Request DTO shared by both VSIM endpoints:
 *   - `POST /vector-set/similarity-search` — executes the search.
 *   - `POST /vector-set/similarity-search/preview` — renders the command
 *     that the search endpoint would execute for the same payload.
 *
 * All three query fields (`elementName`, `vectorValues`, `vectorFp32`) are
 * marked `@IsOptional` because exactly one — not all — must be supplied;
 * the "exactly one of the three" rule is enforced uniformly at the service
 * layer (`resolveVsimQuery`), which raises `BadRequestException` with a
 * clear message if zero or more than one of the three is present. Both
 * the search and preview endpoints reject empty / over-specified payloads
 * with `400`.
 */
export class SimilaritySearchDto extends KeyDto {
  @ApiPropertyOptional({
    type: String,
    description:
      'Run similarity search using an existing element name as the query ' +
      'vector. Mutually exclusive with `vectorValues` and `vectorFp32`; ' +
      'exactly one of the three must be supplied for the search endpoint.',
  })
  @IsOptional()
  @IsRedisString()
  @RedisStringType()
  elementName?: RedisString;

  @ApiPropertyOptional({
    description:
      'Query vector embedding as numeric values. Mutually exclusive with ' +
      '`elementName` and `vectorFp32`; exactly one of the three must be ' +
      'supplied for the search endpoint.',
    type: [Number],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  vectorValues?: number[];

  @ApiPropertyOptional({
    type: String,
    description:
      'Query vector embedding as a base64-encoded little-endian IEEE-754 ' +
      'FP32 blob. Decoded length must be a non-zero multiple of 4 bytes. ' +
      'Mutually exclusive with `elementName` and `vectorValues`.',
  })
  @IsOptional()
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
