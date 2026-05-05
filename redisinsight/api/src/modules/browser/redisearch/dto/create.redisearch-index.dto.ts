import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsDefined,
  IsEnum,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import {
  ApiRedisString,
  IsRedisString,
  RedisStringType,
} from 'src/common/decorators';
import { RedisString } from 'src/common/constants';
import { Type } from 'class-transformer';

export enum RedisearchIndexKeyType {
  HASH = 'hash',
  JSON = 'json',
}

export enum RedisearchIndexDataType {
  TEXT = 'text',
  TAG = 'tag',
  NUMERIC = 'numeric',
  GEO = 'geo',
  GEOSHAPE = 'geoshape',
  VECTOR = 'vector',
}

export class CreateRedisearchIndexFieldDto {
  @ApiRedisString('Name of field to be indexed')
  @IsDefined()
  @RedisStringType()
  @IsRedisString()
  name: RedisString;

  @ApiProperty({
    description: 'Type of how data must be indexed',
    enum: RedisearchIndexDataType,
  })
  @IsDefined()
  @IsEnum(RedisearchIndexDataType, {
    message: `type must be a valid enum value. Valid values: ${Object.values(
      RedisearchIndexDataType,
    )}.`,
  })
  type: RedisearchIndexDataType;
}

export class CreateRedisearchIndexDto {
  @ApiRedisString('Index Name')
  @IsDefined()
  @RedisStringType()
  @IsRedisString()
  index: RedisString;

  @ApiProperty({
    description: 'Type of keys to index',
    enum: RedisearchIndexKeyType,
  })
  @IsDefined()
  @IsEnum(RedisearchIndexKeyType, {
    message: `type must be a valid enum value. Valid values: ${Object.values(
      RedisearchIndexKeyType,
    )}.`,
  })
  type: RedisearchIndexKeyType;

  @ApiRedisString('Keys prefixes to find keys for index', true, false)
  @IsOptional()
  @RedisStringType({ each: true })
  @IsRedisString({ each: true })
  prefixes?: RedisString[];

  @ApiProperty({
    description: 'Fields to index',
    isArray: true,
    type: CreateRedisearchIndexFieldDto,
  })
  @Type(() => CreateRedisearchIndexFieldDto)
  @ValidateNested()
  @ArrayMinSize(1)
  fields: CreateRedisearchIndexFieldDto[];
}
