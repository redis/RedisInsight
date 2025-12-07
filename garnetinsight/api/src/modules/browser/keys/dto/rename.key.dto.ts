import { ApiProperty } from '@nestjs/swagger';
import { IsDefined } from 'class-validator';
import { IsRedisString, RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';
import { KeyDto } from './key.dto';

export class RenameKeyDto extends KeyDto {
  @ApiProperty({
    description: 'New key name',
    type: String,
  })
  @IsDefined()
  @IsRedisString()
  @RedisStringType()
  newKeyName: RedisString;
}
