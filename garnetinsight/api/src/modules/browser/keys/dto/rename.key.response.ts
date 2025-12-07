import { ApiProperty } from '@nestjs/swagger';
import { IsDefined } from 'class-validator';
import { IsRedisString, RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';

export class KeyResponse {
  @ApiProperty({
    description: 'Key Name',
    type: String,
  })
  @IsDefined()
  @IsRedisString()
  @RedisStringType()
  keyName: RedisString;
}

export class RenameKeyResponse extends KeyResponse {}
