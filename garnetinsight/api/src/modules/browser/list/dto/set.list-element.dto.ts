import { KeyDto } from 'src/modules/browser/keys/dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsInt, IsNotEmpty, Min } from 'class-validator';
import { IsRedisString, RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';

export class SetListElementDto extends KeyDto {
  @ApiProperty({
    description: 'List element',
    type: String,
  })
  @IsDefined()
  @IsRedisString()
  @RedisStringType()
  element: RedisString;

  @ApiProperty({
    description: 'Element index',
    type: Number,
    minimum: 0,
  })
  @IsDefined()
  @Min(0)
  @IsInt({ always: true })
  @IsNotEmpty()
  index: number;
}
