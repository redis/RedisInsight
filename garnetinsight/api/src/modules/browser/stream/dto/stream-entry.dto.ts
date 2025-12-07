import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsDefined,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { IsRedisString, RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';
import { Type } from 'class-transformer';

export class StreamEntryFieldDto {
  @ApiProperty({
    type: String,
    description: 'Entry field name',
    example: 'field1',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsRedisString()
  @RedisStringType()
  name: RedisString;

  @ApiProperty({
    type: String,
    description: 'Entry value',
    example: 'value1',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsRedisString()
  @RedisStringType()
  value: RedisString;
}

export class StreamEntryDto {
  @ApiProperty({
    type: String,
    description: 'Entry ID',
    example: '*',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty({
    type: Object,
    description: 'Entry fields',
    example: [
      { name: 'field1', value: 'value1' },
      { name: 'field2', value: 'value2' },
    ],
  })
  @IsDefined()
  @IsNotEmpty()
  @ArrayNotEmpty()
  @IsArray()
  @Type(() => StreamEntryFieldDto)
  @ValidateNested({ each: true })
  fields: StreamEntryFieldDto[];
}
