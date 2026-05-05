import { ArrayNotEmpty, IsArray, IsDefined, IsNotEmpty } from 'class-validator';
import {
  ApiRedisString,
  IsRedisString,
  RedisStringType,
} from 'src/common/decorators';
import { RedisString } from 'src/common/constants';
import { GetConsumersDto } from './get.consumers.dto';

export class DeleteConsumersDto extends GetConsumersDto {
  @ApiRedisString('Names of consumers to delete', true)
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @IsNotEmpty({ each: true })
  @IsRedisString({ each: true })
  @RedisStringType({ each: true })
  consumerNames: RedisString[];
}
