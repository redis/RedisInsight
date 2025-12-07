import { KeyDto } from 'src/modules/browser/keys/dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsDefined } from 'class-validator';
import { IsRedisString, RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';

export class SetStringDto extends KeyDto {
  @ApiProperty({
    description: 'Key value',
    type: String,
  })
  @IsDefined()
  @IsRedisString()
  @RedisStringType()
  value: RedisString;
}
