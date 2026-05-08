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
      'Vector embedding as numeric values. Mutually exclusive with ' +
      '`vectorFp32` - exactly one of the two must be supplied.',
    type: [Number],
  })
  // `vectorValues` and `vectorFp32` are two equivalent representations of the
  // same vector and must not be supplied together. When `vectorFp32` is
  // present we skip validation on `vectorValues`; otherwise the legacy rules
  // (non-empty array) apply.
  @ValidateIf((o) => o.vectorFp32 === undefined)
  @IsArray()
  @ArrayNotEmpty()
  vectorValues?: number[];

  @ApiPropertyOptional({
    type: String,
    description:
      'Vector embedding as a base64-encoded little-endian IEEE-754 FP32 ' +
      'blob. Decoded length must be a non-zero multiple of 4 bytes. ' +
      'Mutually exclusive with `vectorValues`.',
  })
  @ValidateIf((o) => o.vectorValues === undefined)
  @IsString()
  @IsBase64()
  vectorFp32?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Attributes string to associate with the element.',
  })
  @IsOptional()
  @IsString()
  attributes?: string;
}
