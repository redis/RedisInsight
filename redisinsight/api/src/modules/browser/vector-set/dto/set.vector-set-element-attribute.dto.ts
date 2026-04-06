import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsString } from 'class-validator';
import { IsRedisString, RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';
import { KeyDto } from 'src/modules/browser/keys/dto';

export class SetVectorSetElementAttributeDto extends KeyDto {
  @ApiProperty({
    type: String,
    description: 'Element name in the vector set.',
  })
  @IsDefined()
  @IsRedisString()
  @RedisStringType()
  element: RedisString;

  @ApiProperty({
    type: String,
    description: 'Attributes string to set on the element.',
  })
  @IsDefined()
  @IsString()
  attributes: string;
}
