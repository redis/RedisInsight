import { ApiProperty } from '@nestjs/swagger';
import { IsDefined } from 'class-validator';
import {
  ApiRedisString,
  IsRedisString,
  isZSetScore,
  RedisStringType,
} from 'src/common/decorators';
import { RedisString } from 'src/common/constants';

export class ZSetMemberDto {
  @ApiRedisString('Member name value')
  @IsDefined()
  @IsRedisString()
  @RedisStringType()
  name: RedisString;

  @ApiProperty({
    description: 'Member score value.',
    type: Number || String,
    default: 1,
  })
  @IsDefined()
  @isZSetScore()
  score: number | 'inf' | '-inf';
}
