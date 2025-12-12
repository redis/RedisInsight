import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  Validate,
  ValidateIf,
} from 'class-validator';
import { KeyDto } from 'src/modules/browser/keys/dto';
import { RedisString } from 'src/common/constants';
import { VectorSearchQueryType } from 'src/modules/browser/vector-set/constants';
import { VectorValueValidator } from 'src/modules/browser/vector-set/validators/vector-value.validator';

export class SearchVectorSetDto extends KeyDto {
  @ApiProperty({
    description:
      'Query type: ELE (element name), VALUES (number array), or FP32 (binary)',
    enum: VectorSearchQueryType,
    default: VectorSearchQueryType.VALUES,
  })
  @IsOptional()
  @IsEnum(VectorSearchQueryType)
  queryType?: VectorSearchQueryType = VectorSearchQueryType.VALUES;

  @ApiPropertyOptional({
    description: 'Element name for ELE query type',
    type: String,
  })
  @ValidateIf((o) => o.queryType === VectorSearchQueryType.ELE)
  @IsString()
  element?: string;

  @ApiPropertyOptional({
    description:
      'Query vector (array of numbers for VALUES, or binary string for FP32)',
    oneOf: [{ type: 'array', items: { type: 'number' } }, { type: 'string' }],
  })
  @ValidateIf((o) => o.queryType !== VectorSearchQueryType.ELE)
  @Validate(VectorValueValidator)
  vector?: number[] | RedisString;

  @ApiPropertyOptional({
    description: 'Number of results to return (default: 10, max: 1000)',
    type: Number,
    default: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  count?: number;

  @ApiPropertyOptional({
    description: 'EF parameter for search accuracy (default: 200)',
    type: Number,
    default: 200,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  ef?: number;

  @ApiPropertyOptional({
    description: 'Filter expression for attribute filtering',
    type: String,
  })
  @IsOptional()
  @IsString()
  filter?: string;

  @ApiPropertyOptional({
    description: 'Include similarity scores in response',
    type: Boolean,
    default: true,
  })
  @IsOptional()
  withScores?: boolean;

  @ApiPropertyOptional({
    description: 'Include element attributes in response',
    type: Boolean,
    default: false,
  })
  @IsOptional()
  withAttribs?: boolean;
}
