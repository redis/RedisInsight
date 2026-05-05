import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, Validate } from 'class-validator';
import { RedisString } from 'src/common/constants';
import { IsRedisString, RedisStringType } from 'src/common/decorators';
import { IsArrayIndexConstraint } from './array-index.validation';

export class ArrayElementDto {
  @ApiProperty({
    description: 'Array element index as an unsigned 64-bit decimal string.',
    type: String,
    example: '0',
  })
  @IsDefined()
  @Validate(IsArrayIndexConstraint)
  index: string;

  @ApiProperty({
    description: 'Array element value.',
    type: String,
  })
  @IsDefined()
  @IsRedisString()
  @RedisStringType()
  value: RedisString;
}
