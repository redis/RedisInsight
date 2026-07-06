import { IsDefined } from 'class-validator';
import { KeyDto } from 'src/modules/browser/keys/dto';
import {
  ApiRedisString,
  IsRedisString,
  RedisStringType,
} from 'src/common/decorators';
import { RedisString } from 'src/common/constants';

/**
 * Appends a value to the end of the array. The end index is computed
 * server-side (current ARLEN), so no index is supplied.
 */
export class AppendArrayElementDto extends KeyDto {
  @ApiRedisString('Value to append at the end of the array')
  @IsDefined()
  @IsRedisString()
  @RedisStringType()
  value: RedisString;
}
