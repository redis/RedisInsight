import { KeyDto } from 'src/modules/browser/keys/dto';
import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsDefined } from 'class-validator';
import { IsRedisString, RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';

export class DeleteConsumerGroupsDto extends KeyDto {
  @ApiProperty({
    description: 'Consumer group names',
    type: String,
    isArray: true,
    example: ['Group-1', 'Group-1'],
  })
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @IsRedisString({ each: true })
  @RedisStringType({ each: true })
  consumerGroups: RedisString[];
}
