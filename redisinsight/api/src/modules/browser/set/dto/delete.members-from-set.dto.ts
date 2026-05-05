import { KeyDto } from 'src/modules/browser/keys/dto';
import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsDefined } from 'class-validator';
import {
  ApiRedisString,
  IsRedisString,
  RedisStringType,
} from 'src/common/decorators';
import { RedisString } from 'src/common/constants';

export class DeleteMembersFromSetDto extends KeyDto {
  @ApiRedisString('Key members', true)
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @IsRedisString({ each: true })
  @RedisStringType({ each: true })
  members: RedisString[];
}
