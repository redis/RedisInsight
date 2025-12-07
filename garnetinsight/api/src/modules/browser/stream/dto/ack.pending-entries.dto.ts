import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsDefined, IsNotEmpty } from 'class-validator';
import { IsRedisString, RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';
import { GetConsumersDto } from './get.consumers.dto';

export class AckPendingEntriesDto extends GetConsumersDto {
  @ApiProperty({
    description: 'Entries IDs',
    type: String,
    isArray: true,
    example: ['1650985323741-0', '1650985323770-0'],
  })
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @IsRedisString({ each: true })
  @IsNotEmpty({ each: true })
  @RedisStringType({ each: true })
  entries: RedisString[];
}
