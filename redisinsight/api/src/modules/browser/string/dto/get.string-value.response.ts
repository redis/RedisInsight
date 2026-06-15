import { KeyResponse } from 'src/modules/browser/keys/dto';
import { ApiRedisString, RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';

export class GetStringValueResponse extends KeyResponse {
  @ApiRedisString('Key value')
  @RedisStringType()
  value: RedisString;
}
