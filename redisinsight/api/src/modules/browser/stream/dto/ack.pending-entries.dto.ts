import { ArrayNotEmpty, IsArray, IsDefined, IsNotEmpty } from 'class-validator';
import {
  ApiRedisString,
  IsRedisString,
  RedisStringType,
} from 'src/common/decorators';
import { RedisString } from 'src/common/constants';
import { GetConsumersDto } from './get.consumers.dto';

export class AckPendingEntriesDto extends GetConsumersDto {
  @ApiRedisString('Entries IDs', true)
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @IsRedisString({ each: true })
  @IsNotEmpty({ each: true })
  @RedisStringType({ each: true })
  entries: RedisString[];
}
