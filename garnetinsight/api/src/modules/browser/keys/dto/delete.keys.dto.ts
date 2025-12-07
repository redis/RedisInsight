import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsDefined } from 'class-validator';
import { IsRedisString, RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';

export class DeleteKeysDto {
  @ApiProperty({
    description: 'Key name',
    type: String,
    isArray: true,
  })
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @RedisStringType({ each: true })
  @IsRedisString({ each: true })
  keyNames: RedisString[];
}
