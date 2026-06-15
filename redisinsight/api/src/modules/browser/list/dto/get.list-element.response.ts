import { KeyResponse } from 'src/modules/browser/keys/dto';
import { ApiRedisString, RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';

export class GetListElementResponse extends KeyResponse {
  @ApiRedisString('Element value')
  @RedisStringType()
  value: RedisString;
}
