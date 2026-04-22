import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsDefined,
  IsOptional,
  IsString,
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

  @ApiProperty({
    description: 'Vector embedding values.',
    type: [Number],
    isArray: true,
  })
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  vector: number[];

  @ApiPropertyOptional({
    type: String,
    description: 'Attributes string to associate with the element.',
  })
  @IsOptional()
  @IsString()
  attributes?: string;
}
