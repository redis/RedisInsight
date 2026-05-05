import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsDefined,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import {
  ApiRedisString,
  IsRedisString,
  RedisStringType,
} from 'src/common/decorators';
import { RedisString } from 'src/common/constants';
import { Type } from 'class-transformer';

export class StreamEntryFieldDto {
  @ApiRedisString('Entry field name')
  @IsDefined()
  @IsNotEmpty()
  @IsRedisString()
  @RedisStringType()
  name: RedisString;

  @ApiRedisString('Entry value')
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
    type: StreamEntryFieldDto,
    isArray: true,
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
