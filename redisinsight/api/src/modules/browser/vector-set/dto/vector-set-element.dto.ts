import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Validate,
} from 'class-validator';
import { RedisString } from 'src/common/constants';
import { VectorFormat } from '../constants';
import { VectorValueValidator } from '../validators/vector-value.validator';

export class VectorSetElementDto {
  @ApiProperty({
    description: 'Element name',
    type: String,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description:
      'Vector format: VALUES (array of numbers) or FP32 (binary blob)',
    enum: VectorFormat,
    default: VectorFormat.VALUES,
  })
  @IsOptional()
  @IsEnum(VectorFormat)
  format?: VectorFormat = VectorFormat.VALUES;

  @ApiProperty({
    description:
      'Vector data: array of numbers (VALUES) or binary string (FP32)',
    oneOf: [{ type: 'array', items: { type: 'number' } }, { type: 'string' }],
  })
  @IsDefined()
  @Validate(VectorValueValidator)
  vector: number[] | RedisString;

  @ApiPropertyOptional({
    description: 'JSON attributes for the element',
    type: Object,
  })
  @IsOptional()
  attributes?: Record<string, any>;
}
