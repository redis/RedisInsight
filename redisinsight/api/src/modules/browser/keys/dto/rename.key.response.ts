import { IsDefined } from 'class-validator';
import {
  ApiRedisString,
  IsRedisString,
  RedisStringType,
} from 'src/common/decorators';
import { RedisString } from 'src/common/constants';

export class KeyResponse {
  @ApiRedisString('keyName')
  @IsDefined()
  @IsRedisString()
  @RedisStringType()
  keyName: RedisString;
}

export class RenameKeyResponse extends KeyResponse {}
