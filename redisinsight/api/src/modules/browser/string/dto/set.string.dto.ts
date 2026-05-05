import { KeyDto } from 'src/modules/browser/keys/dto';
import { IsDefined } from 'class-validator';
import {
  ApiRedisString,
  IsRedisString,
  RedisStringType,
} from 'src/common/decorators';
import { RedisString } from 'src/common/constants';

export class SetStringDto extends KeyDto {
  @ApiRedisString('Key value')
  @IsDefined()
  @IsRedisString()
  @RedisStringType()
  value: RedisString;
}
