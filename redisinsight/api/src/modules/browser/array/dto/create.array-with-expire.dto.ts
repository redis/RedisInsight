import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsDefined,
  IsEnum,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  ApiRedisString,
  IsArrayIndex,
  IsRedisString,
  RedisStringType,
} from 'src/common/decorators';
import { RedisString } from 'src/common/constants';
import { KeyWithExpireDto } from 'src/modules/browser/keys/dto';

export enum ArrayCreationMode {
  Contiguous = 'contiguous',
  Sparse = 'sparse',
}

export class ArrayElementDto {
  @ApiProperty({
    type: String,
    description: 'Element index as a numeric string (unsigned 64-bit range)',
  })
  @IsDefined()
  @IsArrayIndex()
  index: string;

  @ApiRedisString('Element value')
  @IsDefined()
  @IsRedisString()
  @RedisStringType()
  value: RedisString;
}

export class CreateArrayWithExpireDto extends KeyWithExpireDto {
  @ApiProperty({
    enum: ArrayCreationMode,
    description:
      'Contiguous mode writes values as a run starting at startIndex. ' +
      'Sparse mode writes explicit index/value pairs.',
  })
  @IsDefined()
  @IsEnum(ArrayCreationMode)
  mode: ArrayCreationMode;

  @ApiPropertyOptional({
    type: String,
    description:
      'Start index as a numeric string (unsigned 64-bit range). ' +
      'Required in contiguous mode.',
  })
  @ValidateIf((o) => o.mode === ArrayCreationMode.Contiguous)
  @IsDefined()
  @IsArrayIndex()
  startIndex?: string;

  @ApiRedisString(
    'Element value(s) to write starting at startIndex. Required in contiguous mode.',
    true,
    false,
  )
  @ValidateIf((o) => o.mode === ArrayCreationMode.Contiguous)
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @IsRedisString({ each: true })
  @RedisStringType({ each: true })
  values?: RedisString[];

  @ApiPropertyOptional({
    type: ArrayElementDto,
    isArray: true,
    description: 'Index/value pairs to write. Required in sparse mode.',
  })
  @ValidateIf((o) => o.mode === ArrayCreationMode.Sparse)
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ArrayElementDto)
  elements?: ArrayElementDto[];
}
