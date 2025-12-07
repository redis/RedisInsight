import { KeyDto } from 'src/modules/browser/keys/dto';
import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsDefined } from 'class-validator';
import { IsRedisString, RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';

export class AddMembersToSetDto extends KeyDto {
  @ApiProperty({
    description: 'Set members',
    isArray: true,
    type: String,
  })
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @IsRedisString({ each: true })
  @RedisStringType({ each: true })
  members: RedisString[];
}
