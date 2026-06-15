import { ArrayNotEmpty, IsArray, IsDefined } from 'class-validator';
import {
  ApiRedisString,
  IsRedisString,
  RedisStringType,
} from 'src/common/decorators';
import { RedisString } from 'src/common/constants';

export class DeleteKeysDto {
  @ApiRedisString('Key name', true)
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @RedisStringType({ each: true })
  @IsRedisString({ each: true })
  keyNames: RedisString[];
}
