import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { IsRedisString, RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';

export class AddArrayElementDto {
  @ApiProperty({
    description: 'Zero-based index at which to set the element.',
    type: Number,
    minimum: 0,
  })
  @IsDefined()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  index: number;

  @ApiProperty({
    type: String,
    description: 'Element value.',
  })
  @IsDefined()
  @IsRedisString()
  @RedisStringType()
  value: RedisString;
}
