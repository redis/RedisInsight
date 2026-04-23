import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsBase64,
  IsDefined,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { IsRedisString, RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';

export class AddVectorSetElementDto {
  @ApiProperty({
    type: String,
    description: 'Element name in the vector set.',
  })
  @IsDefined()
  @IsRedisString()
  @RedisStringType()
  name: RedisString;

  @ApiPropertyOptional({
    description:
      'Vector embedding values. Mutually exclusive with `fp32` - exactly one ' +
      'of the two must be supplied.',
    type: [Number],
    isArray: true,
  })
  // Numeric vector and FP32 blob are two equivalent representations of the same
  // value and must not be supplied together. When `fp32` is present we skip
  // validation on `vector`; otherwise the legacy rules (non-empty array) apply.
  @ValidateIf((o) => o.fp32 === undefined)
  @IsArray()
  @ArrayNotEmpty()
  vector?: number[];

  @ApiPropertyOptional({
    type: String,
    description:
      'Base64-encoded little-endian IEEE-754 FP32 blob. Decoded length must ' +
      'be a non-zero multiple of 4 bytes. Mutually exclusive with `vector`.',
  })
  @ValidateIf((o) => o.vector === undefined)
  @IsString()
  @IsBase64()
  fp32?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Attributes string to associate with the element.',
  })
  @IsOptional()
  @IsString()
  attributes?: string;
}
