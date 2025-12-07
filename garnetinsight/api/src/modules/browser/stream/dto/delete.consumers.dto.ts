import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsDefined, IsNotEmpty } from 'class-validator';
import { IsRedisString, RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';
import { GetConsumersDto } from './get.consumers.dto';

export class DeleteConsumersDto extends GetConsumersDto {
  @ApiProperty({
    description: 'Names of consumers to delete',
    type: String,
    isArray: true,
    example: ['consumer-1', 'consumer-2'],
  })
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @IsNotEmpty({ each: true })
  @IsRedisString({ each: true })
  @RedisStringType({ each: true })
  consumerNames: RedisString[];
}
