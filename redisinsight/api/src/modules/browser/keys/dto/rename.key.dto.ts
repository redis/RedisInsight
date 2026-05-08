import { IsDefined } from 'class-validator';
import {
  ApiRedisString,
  IsRedisString,
  RedisStringType,
} from 'src/common/decorators';
import { RedisString } from 'src/common/constants';
import { KeyDto } from './key.dto';

export class RenameKeyDto extends KeyDto {
  @ApiRedisString('New key name')
  @IsDefined()
  @IsRedisString()
  @RedisStringType()
  newKeyName: RedisString;
}
