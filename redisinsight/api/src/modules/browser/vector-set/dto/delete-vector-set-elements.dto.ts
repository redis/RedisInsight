import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsDefined } from 'class-validator';
import { IsRedisString, RedisStringType } from 'src/common/decorators';
import { RedisString } from 'src/common/constants';
import { KeyDto } from 'src/modules/browser/keys/dto';

export class DeleteVectorSetElementsDto extends KeyDto {
  @ApiProperty({
    description: 'Element names to delete',
    type: [String],
  })
  @IsDefined()
  @ArrayNotEmpty()
  @IsRedisString({ each: true })
  @RedisStringType({ each: true })
  elements: RedisString[];
}
