import { ApiProperty } from '@nestjs/swagger';
import { IsDefined } from 'class-validator';
import { RedisString } from 'src/common/constants';
import { IsRedisString, RedisStringType } from 'src/common/decorators';

export class IndexDeleteRequestBodyDto {
  @ApiProperty({
    description: 'Index name',
    type: String,
  })
  @IsDefined()
  @RedisStringType()
  @IsRedisString()
  index: RedisString;
}
